const MAX_FAILURES_LISTED = 15;
const MAX_MESSAGE_LEN = 300;
// Slack rejects a message if any section's text exceeds 3000 chars, or if it has
// more than 50 blocks. Stay comfortably under both.
const SLACK_SECTION_LIMIT = 2900;
const MAX_FAILURE_BLOCKS = 10;

// Greedily pack lines into chunks no longer than SLACK_SECTION_LIMIT characters.
function packLines(lines) {
  const chunks = [];
  let current = "";
  for (const line of lines) {
    const candidate = current ? `${current}\n${line}` : line;
    if (candidate.length > SLACK_SECTION_LIMIT && current) {
      chunks.push(current);
      current = line;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function truncate(str, len) {
  return str.length > len ? `${str.slice(0, len)}…` : str;
}

function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

function failuresFromResults(results) {
  const failures = [];
  for (const run of results.runs || []) {
    const specName = (run.spec && (run.spec.relative || run.spec.name)) || "unknown spec";
    for (const test of run.tests || []) {
      if (test.state !== "failed") continue;
      const firstLine = test.displayError ? stripAnsi(test.displayError).split("\n")[0] : "";
      failures.push({
        spec: specName,
        test: (test.title || []).join(" > ") || "unknown test",
        message: firstLine || "(no error message captured)",
      });
    }
  }
  return failures;
}

function runMeta() {
  return {
    branch: process.env.CIRCLE_BRANCH || process.env.GIT_BRANCH || "local",
    buildUrl: process.env.CIRCLE_BUILD_URL || "",
    buildNum: process.env.CIRCLE_BUILD_NUM || "",
    project: process.env.CIRCLE_PROJECT_REPONAME || "magick-validations",
  };
}

function buildSlackMessage(failures, metaOverrides = {}) {
  const { branch, buildUrl, buildNum, project, headerOverride } = { ...runMeta(), ...metaOverrides };
  const where = buildNum ? `${project} (${branch}, build #${buildNum})` : `${project} (${branch}, local run)`;

  const headerText = headerOverride
    ? `:x: *${headerOverride}* on \`${where}\``
    : failures.length
    ? `:x: *${failures.length} UI check${failures.length === 1 ? "" : "s"} failed* on \`${where}\``
    : `:x: Cypress run failed on \`${where}\` — check the run output for details.`;

  const blocks = [{ type: "section", text: { type: "mrkdwn", text: headerText } }];

  if (failures.length) {
    const listed = failures.slice(0, MAX_FAILURES_LISTED);
    const lines = listed.map(
      (f) => `• *${f.spec} — ${f.test}*\n   _${truncate(f.message, MAX_MESSAGE_LEN)}_`
    );
    if (failures.length > listed.length) {
      lines.push(`_…and ${failures.length - listed.length} more_`);
    }

    const chunks = packLines(lines);
    for (const chunk of chunks.slice(0, MAX_FAILURE_BLOCKS)) {
      blocks.push({
        type: "section",
        text: { type: "mrkdwn", text: chunk.slice(0, SLACK_SECTION_LIMIT) },
      });
    }
    if (chunks.length > MAX_FAILURE_BLOCKS) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `_…${chunks.length - MAX_FAILURE_BLOCKS} more block(s) of failures omitted — open the build for the full list_`,
        },
      });
    }
  }

  if (buildUrl) {
    blocks.push({
      type: "context",
      elements: [{ type: "mrkdwn", text: `<${buildUrl}|View full build, screenshots & videos>` }],
    });
  }

  return { text: headerText.replace(/[:*_`]/g, ""), blocks };
}

async function postToSlack(message, creds = {}) {
  const token = creds.token || process.env.SLACK_BOT_TOKEN;
  const channel = creds.channel || process.env.SLACK_CHANNEL_ID;

  if (!token || !channel) {
    console.warn(
      "[slack-notify] SLACK_BOT_TOKEN and/or SLACK_CHANNEL_ID not set — skipping Slack notification."
    );
    return;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({ channel, ...message }),
      signal: controller.signal,
    });
    const result = await response.json();
    if (!result.ok) {
      console.error(`[slack-notify] Slack API error: ${result.error}`);
      return;
    }
    console.log("[slack-notify] Slack notification posted.");
  } catch (err) {
    if (err.name === "AbortError") {
      console.error("[slack-notify] Slack request timed out after 10s — skipping notification.");
    } else {
      console.error(`[slack-notify] failed to reach Slack: ${err.message}`);
    }
  } finally {
    clearTimeout(timer);
  }
}

async function notifySlackOfCypressRun(results, creds = {}) {
  try {
    if (!results) return;

    if (results.status === "failed" && typeof results.failures === "number") {
      const reason = results.message ? `: ${results.message.split("\n")[0]}` : "";
      await postToSlack(
        buildSlackMessage([], { headerOverride: `Cypress could not complete the run${reason}` }),
        creds
      );
      return;
    }

    const failures = failuresFromResults(results);
    if (failures.length === 0) return;

    await postToSlack(buildSlackMessage(failures), creds);
  } catch (err) {
    console.error(`[slack-notify] unexpected error: ${err.stack || err.message}`);
  }
}

module.exports = {
  notifySlackOfCypressRun,
  buildSlackMessage,
  postToSlack,
  failuresFromResults,
};
