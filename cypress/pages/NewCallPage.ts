/// <reference types="cypress" />

class NewCallPage {
  path = "/app/calls/new";
  callsPath = "/app/calls";

  container = "main, form, [class*='container'], [class*='card'], [class*='content']";
  heading = "h1, h2, h3, [class*='title'], [class*='heading']";
  backBtn = "button[class*='backButton'], button:contains('Back'), a[href*='/app/calls'], [aria-label*='back'], button svg, a svg";
  txtPhone = "input#phoneNumber, input[type='tel'], input[class*='phoneInput'], input[name*='phone'], input[name*='to']";
  selectCountry = "select[name*='country'], select[id*='country'], button[class*='country'], [data-testid*='country'], .country-select";

  selectPrompt = "select#promptTemplate, select[id*='prompt'], select[name*='prompt'], [role='combobox'][id*='prompt'], [data-testid*='prompt-select'], button:contains('Select Prompt'), [class*='prompt-select'], [class*='promptCard']";
  selectCallerId = "select#callerId, select[id*='caller'], select[name*='caller'], select[name*='from'], [role='combobox'][id*='caller'], [data-testid*='caller-id-select']";
  btnAiQuality = "button:contains('Bronze'), button:contains('Copper'), button:contains('Silver'), button:contains('Gold'), button:contains('Gold II'), button:contains('Platinum')";
  selectVoice = "select#voiceId, select#voice, select[id*='voice'], select[name*='voice'], [role='combobox'][data-testid*='voice'], [data-testid*='voice-select'], button:contains('Select Voice')";
  selectLanguage = "select[name*='language'], [role='combobox'][data-testid*='language'], [data-testid*='language-select']";

  txtFirstMessage = "textarea[name*='greeting'], textarea[name*='firstMessage'], input[name*='firstMessage'], textarea[placeholder*='first message'], textarea[placeholder*='First Message'], textarea[placeholder*='greeting'], textarea[placeholder*='Greeting']";
  txtSystemPrompt = "textarea[name*='systemPrompt'], textarea[name*='prompt'], textarea[placeholder*='prompt'], textarea[placeholder*='Prompt'], textarea[placeholder*='instructions'], textarea[placeholder*='Instructions']";

  chkRecordCall = "input[name*='record'], input[type='checkbox'][id*='record']";
  chkVoicemailDetection = "input[name*='voicemail'], input[type='checkbox'][id*='voicemail'], input[type='checkbox'][id*='amd']";

  btnStartCall = "button:contains('Start call now'), button:contains('Start call'), button[class*='submitButton'], form button[type='submit'], button[type='submit'], button.btn-primary";
  btnCancel = "button[class*='cancelButton'], button:contains('Cancel'), button:contains('Discard'), a:contains('Cancel'), a:contains('Back')";

  errorMessage = ".error, .text-danger, [role='alert'], .toast-error, [class*='error'], .invalid-feedback, [class*='alert']";
  successMessage = ".success, .text-success, .toast-success, [class*='success'], [role='status']";

  visit() {
    cy.viewport(1440, 900);
    cy.loginViaUI();
    cy.visit(this.path, { failOnStatusCode: false });
    
    cy.get("body", { timeout: 20000 }).then(($body) => {
      if ($body.find("input[type='password']").length > 0 && /sign in|login/i.test($body.text())) {
        cy.log("Session redirected to login page -> auto-submitting credentials...");
        const userEmail = Cypress.env("MV_TEST_EMAIL") || Cypress.env("CYPRESS_MV_TEST_EMAIL");
        const userPassword = Cypress.env("MV_TEST_PASSWORD") || Cypress.env("CYPRESS_MV_TEST_PASSWORD");
        if (userEmail && userPassword) {
          const signInTab = $body.find("button, [role='tab'], a").filter((_, el) => /^sign in$/i.test((el.innerText || "").trim()));
          if (signInTab.length > 0) {
            cy.wrap(signInTab.first()).click({ force: true });
          }
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
        }
      }
    });

    cy.url({ timeout: 25000 }).should("include", "/app/calls");
    return this;
  }

  getContainer() {
    return cy.get(this.container).first();
  }

  getHeading() {
    return cy.get("body").then(($body) => {
      const heading = $body.find("h1, h2, h3, [class*='title'], [class*='heading']").filter(":visible");
      if (heading.length > 0) return cy.wrap(heading.first());
      return cy.contains("h1, h2, h3, [class*='title']", /New Call|Create Call|Initiate Call|Outbound Call/i);
    });
  }

  getBackButton() {
    return cy.get("body").then(($body) => {
      const back = $body.find("button[class*='backButton'], button, a").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").toLowerCase().trim();
        const aria = (el.getAttribute("aria-label") || "").toLowerCase();
        const cls = (el.className || "").toLowerCase();
        return cls.includes("back") || text.includes("back") || text.includes("calls") || aria.includes("back");
      });
      if (back.length > 0) {
        return cy.wrap(back.first());
      }
      return cy.contains(/back|calls/i);
    });
  }

  getPhoneInput() {
    return cy.get("body").then(($body) => {
      const phoneEl = $body.find("input[type='tel'], input#phoneNumber, input[class*='phoneInput'], input[name*='phone'], input[placeholder*='phone'], input[placeholder*='number'], input[placeholder*='Recipient'], input[placeholder*='+']").filter(":visible");
      if (phoneEl.length > 0) {
        return cy.wrap(phoneEl.first());
      }
      return cy.get("input[type='tel'], input#phoneNumber, input[name*='phone'], input[placeholder*='phone']").first();
    });
  }

  getPromptSelector() {
    return cy.get("body").then(($body) => {
      const promptEl = $body.find("select#promptTemplate, select[id*='prompt'], select[name*='prompt'], [class*='promptCard'], [data-testid*='prompt']");
      if (promptEl.length > 0) {
        return cy.wrap(promptEl.first());
      }
      return cy.get("select, [role='combobox']").first();
    });
  }

  getCallerIdSelector() {
    return cy.get("body").then(($body) => {
      const callerEl = $body.find("select#callerId, select[id*='caller'], select[name*='caller'], select[name*='from']");
      if (callerEl.length > 0) {
        return cy.wrap(callerEl.first());
      }
      return cy.get("select, [role='combobox']").first();
    });
  }

  getStartCallButton() {
    return cy.get("body").then(($body) => {
      const submitBtn = $body.find("button:contains('Start call now'), button:contains('Start call'), button[class*='submitButton']").filter(":visible");
      if (submitBtn.length > 0) {
        return cy.wrap(submitBtn.last());
      }
      return cy.contains("button:visible", /Start call now|Start call/i);
    });
  }

  getCancelButton() {
    return cy.get("body").then(($body) => {
      const cancelBtn = $body.find("button, a").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").trim().toLowerCase();
        const cls = (el.className || "").toLowerCase();
        const aria = (el.getAttribute("aria-label") || "").toLowerCase();
        return text === "cancel" || text === "discard" || text.includes("cancel") || cls.includes("cancel") || cls.includes("back") || text.includes("back") || aria.includes("back");
      });
      if (cancelBtn.length > 0) {
        return cy.wrap(cancelBtn.first());
      }
      return cy.contains("button, a", /cancel|discard|back/i);
    });
  }

  getErrorMessage() {
    return cy.get(this.errorMessage);
  }

  setRecipientPhone(phone: string) {
    this.getPhoneInput().scrollIntoView().should("exist").then(($input) => {
      cy.wrap($input).clear({ force: true });
      cy.wait(100);
      cy.wrap($input).type(phone, { delay: 30, force: true });
    });
    cy.wait(400);
    return this;
  }

  selectPromptOption(promptNameOrId: string = "c0bc06f3-17cc-456e-8d35-b08426ecd0d2") {
    const targetId = "c0bc06f3-17cc-456e-8d35-b08426ecd0d2";
    const query = (promptNameOrId || targetId).toString().toLowerCase();

    cy.get("body").then(($body) => {
      // 1. Standard HTML <select> dropdown
      const $promptSelect = $body.find("select#promptTemplate, select[id*='prompt'], select[name*='prompt']");
      if ($promptSelect.length > 0) {
        const selectEl = $promptSelect.get(0) as unknown as HTMLSelectElement;
        const options = Array.from(selectEl.options);
        const match = options.find((opt) => {
          const val = (opt.value || "").toLowerCase();
          const text = (opt.text || "").toLowerCase();
          return (
            val === targetId ||
            val === query ||
            text.includes("magickvoice system status") ||
            text.includes("system status notification") ||
            text.includes("status notification") ||
            text.includes(query)
          );
        });

        if (match) {
          cy.wrap($promptSelect.first()).select(match.value, { force: true });
        } else if (promptNameOrId) {
          cy.wrap($promptSelect.first()).select(promptNameOrId, { force: true });
        } else if (options.length > 1) {
          cy.wrap($promptSelect.first()).select(options[1].value, { force: true });
        }
        return;
      }

      // 2. Clickable prompt cards
      const $promptCards = $body.find("[class*='promptCard'], [class*='prompt-card'], [data-testid*='prompt'], [class*='promptItem'], [class*='templateCard']");
      if ($promptCards.length > 0) {
        const matchedCard = $promptCards.filter((_, el) => {
          const text = (el.innerText || el.textContent || "").toLowerCase();
          const id = (el.getAttribute("data-id") || el.getAttribute("data-value") || el.id || "").toLowerCase();
          return (
            id.includes(targetId) ||
            text.includes("magickvoice system status") ||
            text.includes("system status notification") ||
            text.includes("status notification") ||
            text.includes(query)
          );
        });
        if (matchedCard.length > 0) {
          cy.wrap(matchedCard.first()).click({ force: true });
        } else {
          cy.wrap($promptCards.first()).click({ force: true });
        }
        return;
      }

      // 3. Custom combobox / Radix / HeadlessUI dropdown
      const $combobox = $body.find("button[role='combobox'], div[class*='select']").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").toLowerCase();
        const id = (el.id || "").toLowerCase();
        return text.includes("prompt") || text.includes("template") || id.includes("prompt");
      });
      if ($combobox.length > 0) {
        cy.wrap($combobox.first()).click({ force: true });
        cy.wait(400);
        cy.get("body").then(($b) => {
          const $options = $b.find("[role='option'], [class*='option'], [class*='item'], div[data-value]");
          if ($options.length > 0) {
            const matchedOption = $options.filter((_, el) => {
              const text = (el.innerText || el.textContent || "").toLowerCase();
              const val = (el.getAttribute("data-value") || el.getAttribute("value") || "").toLowerCase();
              return (
                val.includes(targetId) ||
                text.includes("magickvoice system status") ||
                text.includes("system status notification") ||
                text.includes("status notification") ||
                text.includes(query)
              );
            });
            if (matchedOption.length > 0) {
              cy.wrap(matchedOption.first()).click({ force: true });
            } else {
              cy.wrap($options.first()).click({ force: true });
            }
          }
        });
      }
    });
    cy.wait(800);
    return this;
  }

  selectCallerIdOption(callerIdOrIndex?: string | number) {
    cy.get("body").then(($body) => {
      const $caller = $body.find("select#callerId, select[id*='caller'], select[name*='caller'], select[name*='from']");
      if ($caller.length > 0) {
        const selectEl = $caller.get(0) as unknown as HTMLSelectElement;
        const validOptions = Array.from(selectEl.options).filter(opt => opt.value && opt.value.trim() !== "");
        if (typeof callerIdOrIndex === "string" && callerIdOrIndex) {
          cy.wrap($caller.first()).select(callerIdOrIndex, { force: true });
        } else if (validOptions.length > 0) {
          cy.wrap($caller.first()).select(validOptions[0].value, { force: true });
        } else {
          cy.wrap($caller.first()).select(1, { force: true });
        }
      }
    });
    cy.wait(600);
    return this;
  }

  selectAiQuality(tier: string = "Platinum") {
    cy.get("body").then(($body) => {
      const $tiers = $body.find("button, [role='radio'], [role='button'], div[class*='badge']").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").trim();
        return text === "Bronze" || text === "Copper" || text === "Silver" || text === "Gold" || text === "Gold II" || text === "Platinum";
      });
      if ($tiers.length > 0) {
        const matched = $tiers.filter((_, el) => (el.innerText || el.textContent || "").trim().toLowerCase() === tier.toLowerCase());
        if (matched.length > 0) {
          cy.wrap(matched.first()).click({ force: true });
        } else {
          cy.wrap($tiers.first()).click({ force: true });
        }
      }
    });
    cy.wait(1500); // Allow voices and pipeline warning to clear
    return this;
  }

  fillPromptVariables(defaultText: string = "Operational") {
    cy.get("body").then(($body) => {
      const $form = $body.find("main form, form, [class*='form']");
      if ($form.length > 0) {
        const $inputs = $form.find("input[type='text'], textarea").filter((_, el) => {
          const id = (el.id || "").toLowerCase();
          const name = (el.getAttribute("name") || "").toLowerCase();
          const placeholder = (el.getAttribute("placeholder") || "").toLowerCase();
          const cls = (el.className || "").toLowerCase();
          const isPhone = id.includes("phone") || name.includes("phone") || placeholder.includes("phone");
          const isSearch = cls.includes("search") || placeholder.includes("search") || name.includes("search") || id.includes("search");
          const isHidden = (el as HTMLElement).offsetParent === null;
          return !isPhone && !isSearch && !isHidden;
        });
        if ($inputs.length > 0) {
          $inputs.each((_, el) => {
            const inputEl = el as unknown as HTMLInputElement;
            if (!inputEl.value) {
              cy.wrap(el).clear({ force: true });
              cy.wait(100);
              cy.wrap(el).type(defaultText, { force: true });
            }
          });
        }
      }
    });
    cy.wait(400);
    return this;
  }

  selectVoiceOption(voiceIdOrIndex?: string | number) {
    cy.get("body").then(($body) => {
      const $voice = $body.find("select#voiceId, select#voice, select[id*='voice'], select[name*='voice']");
      if ($voice.length > 0) {
        const selectEl = $voice.get(0) as unknown as HTMLSelectElement;
        const validOptions = Array.from(selectEl.options).filter(opt => opt.value && opt.value.trim() !== "");
        if (typeof voiceIdOrIndex === "string" && voiceIdOrIndex) {
          cy.wrap($voice.first()).select(voiceIdOrIndex, { force: true });
        } else if (validOptions.length > 0) {
          cy.wrap($voice.first()).select(validOptions[0].value, { force: true });
        }
      }
    });
    return this;
  }

  checkAllRequiredBoxes() {
    cy.get("body").then(($body) => {
      const $checkboxes = $body.find("input[type='checkbox']");
      if ($checkboxes.length > 0) {
        cy.wrap($checkboxes).check({ force: true });
      }
    });
    return this;
  }

  setFirstMessage(message: string) {
    cy.get("body").then(($body) => {
      const $msg = $body.find(this.txtFirstMessage);
      if ($msg.length > 0) {
        cy.wrap($msg.first()).clear().type(message);
      }
    });
    return this;
  }

  setSystemPrompt(prompt: string) {
    cy.get("body").then(($body) => {
      const $prompt = $body.find(this.txtSystemPrompt);
      if ($prompt.length > 0) {
        cy.wrap($prompt.first()).clear().type(prompt);
      }
    });
    return this;
  }

  toggleRecording(enable: boolean = true) {
    cy.get("body").then(($body) => {
      const $rec = $body.find(this.chkRecordCall);
      if ($rec.length > 0) {
        if (enable) {
          cy.wrap($rec.first()).check({ force: true });
        } else {
          cy.wrap($rec.first()).uncheck({ force: true });
        }
      }
    });
    return this;
  }

  clickStartCall() {
    cy.wait(1200);
    cy.get("body").then(($body) => {
      const submitBtn = $body.find("button:contains('Start call now'), button:contains('Start call'), button[class*='submitButton']").filter(":visible");
      if (submitBtn.length > 0) {
        cy.wrap(submitBtn.last()).click({ force: true });
      } else {
        cy.contains("button:visible", /Start call now|Start call/i).click({ force: true });
      }
    });
    cy.wait(1000);
    return this;
  }

  clickCancel() {
    cy.get("body").then(($body) => {
      const cancelBtn = $body.find("button, a").filter((_, el) => {
        const text = (el.innerText || el.textContent || "").trim().toLowerCase();
        const cls = (el.className || "").toLowerCase();
        return text === "cancel" || text.includes("cancel") || cls.includes("cancel") || cls.includes("back") || text.includes("back");
      });
      if (cancelBtn.length > 0) {
        cy.wrap(cancelBtn.first()).click({ force: true });
      } else {
        cy.visit(this.callsPath, { failOnStatusCode: false });
      }
    });
    cy.wait(800);
    return this;
  }

  clickBack() {
    this.getBackButton().click({ force: true });
    cy.wait(800);
    return this;
  }

  fillNewCallForm(data: {
    phone: string;
    prompt?: string;
    callerId?: string;
    aiQuality?: string;
    voice?: string;
    firstMessage?: string;
    systemPrompt?: string;
    record?: boolean;
  }) {
    this.setRecipientPhone(data.phone);
    this.selectCallerIdOption(data.callerId);
    this.selectPromptOption(data.prompt || "c0bc06f3-17cc-456e-8d35-b08426ecd0d2");
    cy.wait(1500); // Wait for prompt tools and pipeline options to load
    this.selectAiQuality(data.aiQuality || "Platinum");
    this.fillPromptVariables("Operational");
    this.selectVoiceOption(data.voice);
    this.checkAllRequiredBoxes();
    if (data.firstMessage) this.setFirstMessage(data.firstMessage);
    if (data.systemPrompt) this.setSystemPrompt(data.systemPrompt);
    if (data.record !== undefined) this.toggleRecording(data.record);
    return this;
  }

  verifyOnNewCallPage() {
    cy.url({ timeout: 20000 }).should("include", "/app/calls/new");
    this.getContainer().should("exist");
    return this;
  }

  verifyPageHeaderAndNavigation() {
    this.getContainer().should("exist");
    this.getBackButton().should("exist");
    return this;
  }

  verifyAllInteractiveFormControls() {
    this.getPhoneInput().should("exist");
    this.getStartCallButton().should("exist");
    return this;
  }

  verifyPhoneValidation(invalidPhone: string = "123") {
    this.setRecipientPhone(invalidPhone);
    this.clickStartCall();

    cy.get("body").then(($body) => {
      const phoneInput = $body.find("input[type='tel'], input#phoneNumber, input[class*='phoneInput'], input[name*='phone'], input").get(0) as unknown as HTMLInputElement;
      const hasError = $body.find(this.errorMessage).length > 0;
      const isInvalid = phoneInput && phoneInput.validity ? !phoneInput.validity.valid : false;
      const isAriaInvalid = phoneInput ? phoneInput.getAttribute("aria-invalid") === "true" : false;
      expect(hasError || isInvalid || isAriaInvalid).to.be.true;
    });
    return this;
  }

  dispatchOutboundCall(phone: string) {
    cy.log(`Initiating outbound call to: ${phone}...`);
    this.visit();
    this.fillNewCallForm({
      phone,
      prompt: "c0bc06f3-17cc-456e-8d35-b08426ecd0d2",
      aiQuality: "Platinum",
      firstMessage: "Hello! This is a live verification call from the MagickVoice automated testing pipeline.",
    });
    this.clickStartCall();
    cy.wait(3000);
    cy.log(`Outbound call dispatched to: ${phone}`);
    return this;
  }
}

export const newCallPage = new NewCallPage();
export default NewCallPage;
