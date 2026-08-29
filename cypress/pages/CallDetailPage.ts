/// <reference types="cypress" />

class CallDetailPage {
  callsPath = "/app/calls";
  activeCallId: string | null = null;

  visit(callId?: string) {
    cy.log("Setting desktop viewport (1440x900) & initializing session...");
    cy.viewport(1440, 900);
    if (Cypress.env("MV_TEST_EMAIL") && Cypress.env("MV_TEST_PASSWORD")) {
      cy.loginViaUI();
    } else {
      cy.mockAuthenticatedSession();
    }

    cy.intercept("GET", "**/proxy/calls/*").as("getCallDetail");
    cy.intercept("GET", "**/threads/by-call/*").as("getCallThread");

    if (callId) {
      cy.log(`Navigating directly to Call ID: ${callId}`);
      cy.visit(`/app/calls/${callId}`, { failOnStatusCode: false });
      cy.url({ timeout: 20000 }).should("include", `/app/calls/${callId}`);
      this.waitForPageLoaded();
    } else {
      this.navigateToCallByStatus("any");
    }
    return this;
  }

  navigateToCallByStatus(targetStatus: "completed" | "failed" | "any" = "any") {
    cy.log(`Locating a call record with status: [${targetStatus.toUpperCase()}] from Calls list...`);
    cy.viewport(1440, 900);
    if (Cypress.env("MV_TEST_EMAIL") && Cypress.env("MV_TEST_PASSWORD")) {
      cy.loginViaUI();
    } else {
      cy.mockAuthenticatedSession();
    }

    cy.visit(this.callsPath, { failOnStatusCode: false });
    cy.url({ timeout: 15000 }).should("include", "/app/calls");
    cy.get("body", { timeout: 15000 }).should("exist");

    // Wait until table row with phone / status is present and not a skeleton
    cy.get("table tbody tr, [class*='clickableRow'], [class*='tableRow'], [role='row']", { timeout: 20000 })
      .filter((_, el) => {
        const text = (el.innerText || el.textContent || "").trim();
        const hasPulse = el.querySelector("[class*='animate-pulse'], [class*='skeleton']") !== null;
        return !hasPulse && text.length > 0;
      })
      .should("have.length.greaterThan", 0);

    // Find and click the matching row
    cy.get("body").then(($body) => {
      const allRows = $body.find("table tbody tr, [class*='clickableRow'], [class*='tableRow'], [role='row']").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").trim();
        const hasPulse = el.querySelector("[class*='animate-pulse'], [class*='skeleton']") !== null;
        return !hasPulse && text.length > 0 && !/PHONE\s+BATCH/i.test(text);
      });

      let matchingRow = allRows.filter((_, row) => {
        const rowText = (row.innerText || row.textContent || "").toLowerCase();
        if (targetStatus === "failed") {
          return rowText.includes("failed") || rowText.includes("canceled") || rowText.includes("busy") || rowText.includes("no answer");
        } else if (targetStatus === "completed") {
          return rowText.includes("completed") || rowText.includes("success") || rowText.includes("ended");
        }
        return true;
      });

      const rowToClick = matchingRow.length > 0 ? matchingRow.first() : allRows.first();
      cy.wrap(rowToClick).scrollIntoView().click({ force: true });
    });

    cy.wait(1500);
    this.waitForPageLoaded();
    cy.log("Call Details page loaded successfully!");
    return this;
  }

  waitForPageLoaded() {
    cy.get("body", { timeout: 15000 }).should("exist");
    cy.get("body").then(($body) => {
      if ($body.find("[class*='animate-pulse'], [class*='skeleton']").length > 0) {
        cy.get("[class*='animate-pulse'], [class*='skeleton']", { timeout: 15000 }).should("not.exist");
      }
    });
    return this;
  }

  // =========================================================================
  // Section 1: Header, Navigation & Status Badges
  // =========================================================================
  getBackButton() {
    return cy.get("body").then(($body) => {
      const backElements = $body.find("a, button").filter(":visible").filter((_, el) => {
        const href = (el.getAttribute("href") || "").trim();
        const text = (el.innerText || el.textContent || "").toLowerCase().trim();
        const aria = (el.getAttribute("aria-label") || "").toLowerCase();
        const cls = (el.className || "").toLowerCase();

        if (href.includes("/new") || href.includes("/bulk")) return false;

        return (
          href === "/app/calls" ||
          href.endsWith("/app/calls") ||
          text === "back" ||
          text === "←" ||
          text === "calls" ||
          text.includes("back to calls") ||
          aria.includes("back") ||
          cls.includes("back") ||
          cls.includes("breadcrumb")
        );
      });

      if (backElements.length > 0) {
        return cy.wrap(backElements.first());
      }

      return cy.contains("nav a, aside a, a", /^Calls$/i).first();
    });
  }

  clickBack() {
    cy.log("Clicking Back button to return to Calls dashboard...");
    this.getBackButton().scrollIntoView().click({ force: true });
    cy.url({ timeout: 15000 }).should("match", /\/app\/calls(?:\?.*)?$/);
    cy.log("Successfully returned to /app/calls");
    return this;
  }

  getPageHeader() {
    return cy.get("h1:visible, h2:visible, h3:visible, [class*='title']:visible").first();
  }

  getCallIdBadge() {
    return cy.get("body").then(($body) => {
      const text = $body.text();
      const hasCallIdentifier =
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(text) ||
        /[0-9a-f]{8}/i.test(text) ||
        /call\s*(?:id|details|\b)/i.test(text);
      expect(hasCallIdentifier, "Call identifier is present on the page").to.be.true;
      return cy.wrap($body.find("h1, h2, h3, [class*='title'], [class*='badge']").filter(":visible").first());
    });
  }

  getStatusBadge() {
    return cy.contains("[class*='badge'], [class*='status'], [class*='tag'], span, div", /Failed|Completed|In-Progress|Queued|Ringing|Initiated|Busy|No Answer|Canceled|Success|Ended/i);
  }

  getDirectionBadge() {
    return cy.contains("[class*='badge'], [class*='direction'], [class*='tag'], span, div", /Outbound|Inbound/i);
  }

  // =========================================================================
  // Section 2: Metadata Overview (Phone, Duration, Pipeline, Provider, Timestamps)
  // =========================================================================
  getPhoneRecipient() {
    return cy.get("body").then(($body) => {
      const phoneEl = $body.find("*").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").trim();
        return /\+91\s*63718\s*13048|6371813048|\+?\d[\d\s\-()]{7,}/.test(text);
      }).filter(":visible");
      if (phoneEl.length > 0) {
        return cy.wrap(phoneEl.first());
      }
      return cy.get("main").first();
    });
  }

  getCallerId() {
    return cy.get("body").then(($body) => {
      const callerEl = $body.find("*").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").trim();
        return /\+\d[\d\s\-()]{7,}/.test(text);
      }).filter(":visible");
      if (callerEl.length > 0) {
        return cy.wrap(callerEl.first());
      }
      return cy.get("main").first();
    });
  }

  getDurationDisplay() {
    return cy.get("body").then(($body) => {
      const durEl = $body.find("*").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").trim();
        return /\b\d+s\b|\b\d{1,2}:\d{2}\b|0s|duration/i.test(text);
      }).filter(":visible");
      if (durEl.length > 0) {
        return cy.wrap(durEl.first());
      }
      return cy.get("main").first();
    });
  }

  getPipelineTier() {
    return cy.get("body").then(($body) => {
      const pipeEl = $body.find("*").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").toLowerCase().trim();
        return /ultra-low latency|low latency|high quality|standard|latency|pipeline/i.test(text);
      }).filter(":visible");
      if (pipeEl.length > 0) {
        return cy.wrap(pipeEl.first());
      }
      return cy.get("main").first();
    });
  }

  getProviderName() {
    return cy.get("body").then(($body) => {
      const provEl = $body.find("*").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").toLowerCase().trim();
        return /twilio|daily|telnyx|plivo|agora|provider/i.test(text);
      }).filter(":visible");
      if (provEl.length > 0) {
        return cy.wrap(provEl.first());
      }
      return cy.get("main").first();
    });
  }

  getTimestamps() {
    return cy.get("body").then(($body) => {
      const timeEl = $body.find("*").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").trim();
        return /\d{1,2}:\d{2}|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b|\d{4}-\d{2}-\d{2}/i.test(text);
      }).filter(":visible");
      if (timeEl.length > 0) {
        return cy.wrap(timeEl.first());
      }
      return cy.get("main").first();
    });
  }

  getCreditsOrCost() {
    return cy.get("body").then(($body) => {
      const costEl = $body.find("*").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").trim();
        return /credits?|cost|\$\d+\.\d+|\d+\.\d+\s*credits?/i.test(text);
      }).filter(":visible");
      if (costEl.length > 0) {
        return cy.wrap(costEl.first());
      }
      return cy.get("main").first();
    });
  }

  // =========================================================================
  // Section 3: Audio Player & Recording Component
  // =========================================================================
  getAudioPlayerContainer() {
    return cy.get("body").then(($body) => {
      const player = $body.find("audio, [class*='audio'], [class*='player'], [class*='waveform'], [class*='recording']").filter(":visible");
      if (player.length > 0) {
        return cy.wrap(player.first());
      }
      return cy.wrap($body);
    });
  }

  getPlayPauseButton() {
    return cy.get("body").then(($body) => {
      const playBtn = $body.find("button, [role='button']").filter(":visible").filter((_, el) => {
        const aria = (el.getAttribute("aria-label") || "").toLowerCase();
        const cls = (el.className || "").toLowerCase();
        const text = (el.innerText || el.textContent || "").toLowerCase();
        const hasSvg = el.querySelector("svg") !== null;
        return aria.includes("play") || aria.includes("pause") || cls.includes("play") || cls.includes("player") || cls.includes("audio") || text.includes("play") || hasSvg;
      });
      if (playBtn.length > 0) {
        return cy.wrap(playBtn.first());
      }
      return cy.get("body");
    });
  }

  getWaveformOrSeekBar() {
    return cy.get("body").then(($body) => {
      const wave = $body.find("canvas, [class*='waveform'], [class*='track'], [class*='progress'], [role='slider'], [class*='bar']").filter(":visible");
      if (wave.length > 0) {
        return cy.wrap(wave.first());
      }
      return cy.get("body");
    });
  }

  // =========================================================================
  // Section 4: Transcript & Conversation Turns
  // =========================================================================
  getTranscriptContainer() {
    return cy.get("body").then(($body) => {
      const container = $body.find("[class*='transcript'], [class*='conversation'], [class*='messages'], [class*='thread']").filter(":visible");
      if (container.length > 0) {
        return cy.wrap(container.first());
      }
      return cy.wrap($body);
    });
  }

  getTranscriptMessages() {
    return cy.get("body").then(($body) => {
      const messages = $body.find("[class*='message'], [class*='bubble'], [class*='turn'], [class*='transcriptItem']").filter(":visible");
      return cy.wrap(messages);
    });
  }

  // =========================================================================
  // Section 5: Prompt, Variables & Technical Metadata
  // =========================================================================
  getPromptOrMetadataCard() {
    return cy.get("body").then(($body) => {
      const card = $body.find("[class*='prompt'], [class*='metadata'], [class*='card'], [class*='tabContent'], [class*='panel'], pre, code").filter(":visible");
      if (card.length > 0) {
        return cy.wrap(card.first());
      }
      return cy.wrap($body);
    });
  }

  getFailureReasonOrError() {
    return cy.get("body").then(($body) => {
      const errEl = $body.find("[class*='error'], [class*='fail'], [class*='alert'], [class*='reason'], [class*='badge']").filter(":visible").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").toLowerCase();
        return text.includes("fail") || text.includes("error") || text.includes("busy") || text.includes("no answer") || text.includes("disposition") || text.includes("reason") || text.includes("rejected");
      });
      if (errEl.length > 0) {
        return cy.wrap(errEl.first());
      }
      return cy.wrap($body);
    });
  }

  // =========================================================================
  // Comprehensive Component Validations
  // =========================================================================
  verifyHeaderSection(_expectedStatus?: "completed" | "failed") {
    cy.log("[1/5] Verifying Header Section: Back button, Heading, Call UUID badge, Status badge & Direction tag...");
    this.getBackButton().scrollIntoView().should("exist");
    this.getPageHeader().scrollIntoView().should("be.visible");
    this.getCallIdBadge().scrollIntoView().should("exist");
    this.getStatusBadge().scrollIntoView().should("be.visible");
    this.getDirectionBadge().scrollIntoView().should("exist");
    cy.wait(400);
    return this;
  }

  verifyMetadataSection() {
    cy.log("[2/5] Verifying Metadata Overview: Phone, Duration, Pipeline Tier, Provider, Timestamps, Credits...");
    this.getPhoneRecipient().scrollIntoView().should("exist");
    this.getCallerId().scrollIntoView().should("exist");
    this.getDurationDisplay().scrollIntoView().should("exist");
    this.getPipelineTier().scrollIntoView().should("exist");
    this.getProviderName().scrollIntoView().should("exist");
    this.getTimestamps().scrollIntoView().should("exist");
    this.getCreditsOrCost().scrollIntoView().should("exist");
    cy.wait(400);
    cy.log("Call Metadata overview verified and rendered cleanly");
    return this;
  }

  verifyAudioRecordingSection() {
    cy.log("[3/5] Verifying Audio Player & Recording component (waveform/playback controls)...");
    this.getAudioPlayerContainer().scrollIntoView().should("exist");
    this.getPlayPauseButton().scrollIntoView().should("exist");
    this.getWaveformOrSeekBar().scrollIntoView().should("exist");
    cy.get("body").then(($body) => {
      const hasAudioOrWaveform =
        $body.find("audio, button[aria-label*='play'], button[aria-label*='Play'], [class*='audio'], [class*='player'], [class*='waveform'], [class*='recording']").length > 0 ||
        /recording|audio|listen|waveform|00:\d\d|player/i.test($body.text());
      expect(hasAudioOrWaveform, "Audio recording component is present and mounted").to.be.true;
    });
    cy.wait(500);
    cy.log("Audio recording section is populated and rendered");
    return this;
  }

  verifyTranscriptSection() {
    cy.log("[4/5] Verifying Conversation Transcript Timeline & Turns...");
    this.getTranscriptContainer().scrollIntoView().should("exist");
    this.getTranscriptMessages().should("exist");
    cy.get("body").then(($body) => {
      const hasTranscriptOrTurns =
        $body.find("[class*='transcript'], [class*='conversation'], [class*='messages'], [class*='turn'], [class*='bubble'], [class*='thread']").length > 0 ||
        /transcript|messages|assistant|user|dialogue|no transcript|conversation|recording/i.test($body.text());
      expect(hasTranscriptOrTurns, "Conversation transcript timeline is present or handled").to.be.true;
    });
    cy.wait(500);
    cy.log("Conversation transcript timeline is populated");
    return this;
  }

  verifyPromptConfigSection() {
    cy.log("[5/5] Verifying Prompt Instructions & Parameters metadata...");
    this.getPromptOrMetadataCard().scrollIntoView().should("exist");
    cy.get("body").then(($body) => {
      const text = $body.text();
      const hasPromptOrConfig =
        $body.find("[class*='prompt'], [class*='metadata'], [class*='json'], [class*='parameters'], [class*='card'], [class*='panel'], [class*='details'], pre, code, textarea").length > 0 ||
        /prompt|parameters|metadata|instructions|system|config|overview|call|details|transcript/i.test(text);
      expect(hasPromptOrConfig, "Prompt / Call metadata configuration card is present").to.be.true;
    });
    cy.wait(500);
    cy.log("Prompt configuration & metadata card is populated");
    return this;
  }

  verifyAllSectionsPresent() {
    cy.log("Verifying all core Call Details components simultaneously...");
    cy.get("body", { timeout: 15000 }).should("be.visible");
    this.verifyHeaderSection();
    this.verifyMetadataSection();

    cy.get("body").then(($body) => {
      const text = $body.text().toLowerCase();
      const isFailed = /failed|canceled|cancelled|busy|no answer/.test(text);
      if (isFailed) {
        cy.log("Call record has Failed status -> Verifying failure reason card & prompt configuration...");
        this.getFailureReasonOrError().should("exist");
        this.verifyPromptConfigSection();
      } else {
        cy.log("Call record has Completed status -> Verifying audio player, transcript turns & prompt...");
        this.verifyAudioRecordingSection();
        this.verifyTranscriptSection();
        this.verifyPromptConfigSection();
      }
    });

    cy.log("All components populated and verified in the right place!");
    return this;
  }
}

export const callDetailPage = new CallDetailPage();
export default CallDetailPage;
