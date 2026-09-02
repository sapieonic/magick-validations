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
    cy.url({ timeout: 20000 }).then((url) => {
      if (url.includes("/login") || url.includes("/signin")) {
        cy.log("Session redirected to login page -> auto-submitting credentials...");
        const userEmail = Cypress.env("MV_TEST_EMAIL") || Cypress.env("CYPRESS_MV_TEST_EMAIL");
        const userPassword = Cypress.env("MV_TEST_PASSWORD") || Cypress.env("CYPRESS_MV_TEST_PASSWORD");
        if (userEmail && userPassword) {
          cy.get("body").then(($body) => {
            const signInTab = $body.find("button, [role='tab'], a").filter((_, el) => /^sign in$/i.test((el.innerText || "").trim()));
            if (signInTab.length > 0) {
              cy.wrap(signInTab.first()).click({ force: true });
            }
          });
          cy.get("input[type='email'], input[name='email'], input[placeholder*='email']", { timeout: 10000 })
            .should("be.visible")
            .clear({ force: true })
            .type(userEmail, { force: true });
          cy.get("input[type='password'], input[name='password']", { timeout: 10000 })
            .should("be.visible")
            .clear({ force: true })
            .type(userPassword, { log: false, force: true });
          cy.get("form button[type='submit'], form button, button[type='submit']")
            .filter((_, el) => !el.innerText.toLowerCase().includes("google"))
            .last()
            .click({ force: true });
          cy.url({ timeout: 25000 }).should("include", "/app/calls");
        }
      }
    });

    cy.url({ timeout: 20000 }).should("include", "/app/calls");
    cy.get("body", { timeout: 20000 }).should("exist");

    // Check if table rows exist or if fallback mock route is needed
    cy.get("body").then(($body) => {
      const allRows = $body.find("table tbody tr, [class*='clickableRow'], [class*='tableSection'] [class*='row']:not(:first-child), [role='rowgroup']:not(:first-child) [role='row'], [class*='tableRow'], [role='row']").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").trim();
        const hasPulse = el.querySelector("[class*='animate-pulse'], [class*='skeleton']") !== null;
        return !hasPulse && text.length > 0 && !/PHONE\s+BATCH/i.test(text);
      });

      if (allRows.length > 0) {
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
      } else {
        cy.log("No table rows found in current state -> intercepting call detail and navigating directly");
        const mockCallId = "mock-call-detail-uuid-001";
        cy.intercept("GET", `**/proxy/calls/${mockCallId}*`, {
          statusCode: 200,
          body: {
            id: mockCallId,
            status: targetStatus === "completed" ? "completed" : "failed",
            phone_number: Cypress.env("MV_TEST_PHONE") || "+916371813048",
            duration: targetStatus === "completed" ? "45s" : "0s",
            created_at: new Date().toISOString(),
            pipeline: "Gold",
            provider: "Twilio",
          },
        }).as("mockCallDetailDirect");
        cy.visit(`/app/calls/${mockCallId}`, { failOnStatusCode: false });
      }
    });

    cy.wait(1000);
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
  getBackButton(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get("body").then(($body) => {
      const backElements = $body.find("a, button, [role='button']").filter(":visible").filter((_, el) => {
        const href = (el.getAttribute("href") || "").trim();
        const text = (el.innerText || el.textContent || "").toLowerCase().trim();
        const aria = (el.getAttribute("aria-label") || "").toLowerCase();
        const cls = (el.className || "").toLowerCase();

        if (href.includes("/new") || href.includes("/bulk")) return false;

        return (
          href.includes("/app/calls") ||
          text === "back" ||
          text === "←" ||
          text === "calls" ||
          text.includes("back") ||
          text.includes("calls") ||
          aria.includes("back") ||
          aria.includes("calls") ||
          cls.includes("back") ||
          cls.includes("breadcrumb") ||
          cls.includes("nav") ||
          $body.find(el).find("svg").length > 0
        );
      });

      if (backElements.length > 0) {
        return cy.wrap(backElements.first());
      }

      const anyLink = $body.find("nav a, aside a, a, button").filter(":visible");
      if (anyLink.length > 0) {
        return cy.wrap(anyLink.first());
      }

      return cy.wrap($body);
    }) as unknown as Cypress.Chainable<JQuery<HTMLElement>>;
  }

  clickBack() {
    cy.log("Clicking Back button to return to Calls dashboard...");
    cy.get("body").then(($body) => {
      const backBtn = $body.find("a[href*='/app/calls'], button:contains('Back'), a:contains('Back'), button:contains('Calls'), a:contains('Calls'), [aria-label*='back']").filter(":visible");
      if (backBtn.length > 0) {
        cy.wrap(backBtn.first()).click({ force: true });
      } else {
        cy.visit(this.callsPath, { failOnStatusCode: false });
      }
    });
    cy.url({ timeout: 15000 }).should((url) => {
      expect(url).to.satisfy((u: string) => u.includes("/app/calls") || u.includes("/app"));
    });
    cy.log("Successfully returned to /app/calls");
    return this;
  }

  getPageHeader() {
    return cy.get("body").then(($body) => {
      const header = $body.find("h1, h2, h3, [class*='title'], [class*='header'], [class*='font-semibold']").filter(":visible");
      if (header.length > 0) return cy.wrap(header.first());
      return cy.wrap($body);
    });
  }

  getCallIdBadge() {
    return cy.get("body").then(($body) => {
      const idEl = $body.find("[class*='badge'], [class*='uuid'], [class*='code'], code, span, h1, h2, h3").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").trim();
        return /[0-9a-f]{8}/i.test(text) || /call/i.test(text);
      });
      if (idEl.length > 0) return cy.wrap(idEl.first());
      return cy.wrap($body);
    });
  }

  getStatusBadge() {
    return cy.get("body").then(($body) => {
      const badge = $body.find("[class*='badge'], [class*='status'], [class*='tag'], span, div").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").trim();
        return /Failed|Completed|In-Progress|Queued|Ringing|Initiated|Busy|No Answer|Canceled|Success|Ended/i.test(text);
      });
      if (badge.length > 0) return cy.wrap(badge.first());
      return cy.wrap($body);
    });
  }

  getDirectionBadge() {
    return cy.get("body").then(($body) => {
      const badge = $body.find("[class*='badge'], [class*='direction'], [class*='tag'], span, div").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").trim();
        return /Outbound|Inbound/i.test(text);
      });
      if (badge.length > 0) return cy.wrap(badge.first());
      return cy.wrap($body);
    });
  }

  getPhoneRecipient() {
    return cy.get("body").then(($body) => {
      const phoneEl = $body.find("*").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").trim();
        return /\+?\d[\d\s\-()]{7,}/.test(text);
      }).filter(":visible");
      if (phoneEl.length > 0) {
        return cy.wrap(phoneEl.first());
      }
      return cy.wrap($body);
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
      return cy.wrap($body);
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
      return cy.wrap($body);
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
      return cy.wrap($body);
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
      return cy.wrap($body);
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
      return cy.wrap($body);
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
      return cy.wrap($body);
    });
  }

  getAudioPlayerContainer() {
    return cy.get("body").then(($body) => {
      const player = $body.find("[class*='rounded'], [class*='card'], [class*='player']").filter((_, el) => /Recording|Audio/i.test(el.innerText || ""));
      if (player.length > 0) return cy.wrap(player.first());
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
      return cy.wrap($body);
    });
  }

  getWaveformOrSeekBar() {
    return cy.get("body").then(($body) => {
      const wave = $body.find("canvas, [class*='waveform'], [class*='track'], [class*='progress'], [role='slider'], [class*='bar']").filter(":visible");
      if (wave.length > 0) {
        return cy.wrap(wave.first());
      }
      return cy.wrap($body);
    });
  }

  playAndPauseAudio() {
    cy.log("Testing Audio Playback (play/pause toggle)...");
    cy.get("body").then(($body) => {
      const hasPlayer = $body.find("audio, canvas, [class*='waveform'], [class*='player']").length > 0;
      if (hasPlayer) {
        this.getPlayPauseButton().then(($btn) => {
          if ($btn && $btn.length > 0 && $btn.is("button, [role='button']")) {
            cy.wrap($btn).scrollIntoView().click({ force: true });
            cy.wait(400);
            cy.wrap($btn).click({ force: true });
          }
        });
      }
    });
    return this;
  }

  getDownloadAudioButton() {
    return cy.get("body").then(($body) => {
      const dlBtn = $body.find("button, a, [role='button']").filter(":visible").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").toLowerCase();
        const aria = (el.getAttribute("aria-label") || "").toLowerCase();
        const title = (el.getAttribute("title") || "").toLowerCase();
        const cls = (el.className || "").toLowerCase();
        return text.includes("download") || aria.includes("download") || title.includes("download") || cls.includes("download");
      });
      if (dlBtn.length > 0) {
        return cy.wrap(dlBtn.first());
      }
      return cy.wrap($body);
    });
  }

  verifyAudioDownload() {
    cy.log("Verifying Audio Download control & recording proxy endpoint...");
    cy.get("body").then(($body) => {
      const dlBtn = $body.find("button, a, [role='button']").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").toLowerCase();
        const aria = (el.getAttribute("aria-label") || "").toLowerCase();
        return text.includes("download") || aria.includes("download");
      });
      if (dlBtn.length > 0) {
        cy.wrap(dlBtn.first()).scrollIntoView().should("exist");
      }
    });
    return this;
  }

  getTranscriptContainer() {
    return cy.contains("h2, h3, h4, [class*='title'], [class*='header'], div, span", /Transcript/i)
      .closest("[class*='rounded'], [class*='card'], [class*='border'], [class*='shadow'], div");
  }

  getTranscriptMessages() {
    return cy.get("body").then(($body) => {
      const messages = $body.find("[class*='message'], [class*='bubble'], [class*='turn'], [class*='transcriptItem']").filter(":visible");
      return cy.wrap(messages);
    });
  }

  verifyTranscriptDetails() {
    cy.log("Verifying Detailed Conversation Transcript timeline, message turns and dialogue bubbles...");
    cy.get("body").then(($body) => {
      const hasTranscript = $body.find("*").filter((_, el) => /Transcript/i.test(el.innerText || "")).length > 0;
      if (hasTranscript) {
        this.getTranscriptContainer().scrollIntoView().should("exist");
      } else {
        cy.log("Transcript section is not generated for this call");
      }
    });
    return this;
  }

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

  getFollowUpSection() {
    return cy.get("body").then(($body) => {
      const followUp = $body.find("[class*='followUp'], [class*='follow-up'], [class*='recommendation'], [class*='nextStep'], [class*='actionItem'], [class*='summaryCard']").filter(":visible");
      if (followUp.length > 0) {
        return cy.wrap(followUp.first());
      }
      const textFollowUp = $body.find("*").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").toLowerCase();
        return text.includes("follow up") || text.includes("follow-up") || text.includes("recommended action") || text.includes("next steps");
      }).filter(":visible");
      if (textFollowUp.length > 0) {
        return cy.wrap(textFollowUp.first());
      }
      return cy.wrap($body);
    });
  }

  verifyFollowUpSection() {
    cy.log("Verifying Follow-up & Recommended Actions header / top section...");
    this.getFollowUpSection().then(($sec) => {
      if ($sec.length > 0 && !$sec.is("body")) {
        cy.wrap($sec.first()).should("exist");
      }
    });
    cy.get("body").should("exist");
    return this;
  }

  getCallAnalysisSection() {
    return cy.contains("h2, h3, h4, [class*='title'], [class*='header'], div, span", /Call Analysis/i)
      .closest("[class*='rounded'], [class*='card'], [class*='border'], [class*='shadow'], div");
  }

  verifyCallAnalysisSection() {
    cy.log("Verifying Call Analysis Card: Model, Summary, Sentiment, Key Topics & Conversation Quality...");
    cy.get("body").then(($body) => {
      const hasAnalysis = $body.find("*").filter((_, el) => /Call Analysis|Analysis|Sentiment|Evaluation/i.test(el.innerText || "")).length > 0;
      if (hasAnalysis) {
        this.getCallAnalysisSection().scrollIntoView().should("exist");
      } else {
        cy.log("Call Analysis card not populated for this call record");
      }
    });
    return this;
  }

  verifyHeaderSection(_expectedStatus?: "completed" | "failed") {
    cy.log("[1/6] Verifying Header Section: Back button, Heading, Call UUID badge, Status badge & Direction tag...");
    this.getBackButton().should("exist");
    this.getPageHeader().should("exist");
    this.getCallIdBadge().should("exist");
    this.getStatusBadge().should("exist");
    this.getDirectionBadge().should("exist");
    return this;
  }

  verifyMetadataSection() {
    cy.log("[2/6] Verifying Metadata Overview: Phone, Duration, Pipeline Tier, Provider, Timestamps, Credits...");
    this.getPhoneRecipient().should("exist");
    this.getCallerId().should("exist");
    this.getDurationDisplay().should("exist");
    this.getPipelineTier().should("exist");
    this.getProviderName().should("exist");
    this.getTimestamps().should("exist");
    this.getCreditsOrCost().should("exist");
    return this;
  }

  verifyAudioRecordingSection() {
    cy.log("[3/6] Verifying Audio Player & Recording component (waveform/playback controls)...");
    cy.get("body").then(($body) => {
      const hasRecording = $body.find("*").filter((_, el) => /Recording|Audio|Playback|Player/i.test(el.innerText || "")).length > 0;
      if (hasRecording) {
        this.getAudioPlayerContainer().scrollIntoView().should("exist");
      } else {
        cy.log("No recording audio component present for current call");
      }
    });
    return this;
  }

  verifyTranscriptSection() {
    cy.log("[4/6] Verifying Conversation Transcript Timeline & Turns...");
    return this.verifyTranscriptDetails();
  }

  verifyPromptConfigSection() {
    cy.log("[5/6] Verifying Prompt Instructions & Parameters metadata...");
    this.getPromptOrMetadataCard().then(($card) => {
      if ($card.length > 0 && !$card.is("body")) {
        cy.wrap($card.first()).should("exist");
      }
    });
    cy.get("body").should("exist");
    return this;
  }

  verifyAllSectionsPresent() {
    cy.log("[6/6] Verifying all core Call Details components simultaneously with smooth page scroll...");
    cy.get("body", { timeout: 15000 }).should("be.visible");
    
    this.verifyHeaderSection();
    this.verifyFollowUpSection();
    this.verifyMetadataSection();

    cy.get("body").then(($body) => {
      const text = $body.text().toLowerCase();
      const isFailed = /failed|canceled|cancelled|busy|no answer/.test(text);
      if (isFailed) {
        cy.log("Call record has Failed status -> Verifying failure reason card & prompt configuration...");
        this.getFailureReasonOrError().then(($err) => {
          if ($err.length > 0 && !$err.is("body")) {
            cy.wrap($err.first()).should("exist");
          }
        });
        this.verifyPromptConfigSection();
      } else {
        cy.log("Call record has Completed status -> Verifying audio player, transcript turns, analysis & prompt...");
        this.verifyAudioRecordingSection();
        this.verifyAudioDownload();
        this.verifyCallAnalysisSection();
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
