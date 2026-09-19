(() => {
  const motivationHardNegatives = {
    hn1: {
      label: "Candidate B · backpack",
      title: "The overall appearance matches. The backpack construction does not.",
      target: "small plain backpack · thin straps",
      negative: "medium backpack · thick padded straps · front pocket",
      image: "assets/examples/hn_1.png",
      focus: "backpack",
      difference: "Backpack construction differs despite the same coarse black-backpack cue.",
      negativeLabel: "CANDIDATE B · WRONG ID"
    },
    hn2: {
      label: "Candidate C · jacket",
      title: "The color and category match. One construction detail changes the jacket cue.",
      target: "front zipper · subtle side pockets",
      negative: "pullover · kangaroo pocket · no front zipper",
      image: "assets/examples/hn_2.png",
      focus: "jacket",
      difference: "Jacket construction differs even though both candidates satisfy the coarse green-jacket description.",
      negativeLabel: "CANDIDATE C · WRONG ID"
    },
    hn3: {
      label: "Candidate D · shoes",
      title: "The shoe color matches, but the local construction changes.",
      target: "plain white low-top sneakers",
      negative: "white high-top sneakers · dark sole",
      image: "assets/examples/hn_3.png",
      focus: "shoes",
      difference: "Low-top versus high-top construction resolves an identity-wrong semantic match.",
      negativeLabel: "CANDIDATE D · WRONG ID"
    },
    hn4: {
      label: "Candidate E · hair + tote side",
      title: "The dominant cues still agree, but two smaller relational cues do not.",
      target: "straight shoulder-length hair · tote in left hand",
      negative: "loose low ponytail · tote in right hand",
      image: "assets/examples/hn_4.png",
      focus: "hair-tote",
      difference: "Hair structure and tote-side relation differ while the dominant semantic description remains plausible.",
      negativeLabel: "CANDIDATE E · WRONG ID"
    }
  };

  const motivationSharedCueText = "dark hair · green jacket · black pants · white shoes · black backpack · beige tote";
  const motivationStory = document.querySelector("[data-motivation-story]");
  const motivationBeats = motivationStory ? [...motivationStory.querySelectorAll("[data-motivation-beat]")] : [];
  const motivationScenes = motivationStory ? [...motivationStory.querySelectorAll("[data-motivation-scene]")] : [];
  const motivationChallenge = motivationStory?.querySelector("[data-motivation-challenge]");
  const motivationCandidates = motivationChallenge ? [...motivationChallenge.querySelectorAll("[data-motivation-candidate]")] : [];
  const motivationCueButtons = motivationChallenge ? [...motivationChallenge.querySelectorAll("[data-motivation-cue]")] : [];
  const motivationRevealButton = motivationChallenge?.querySelector("[data-motivation-reveal]");
  const motivationResetButton = motivationChallenge?.querySelector("[data-motivation-reset]");
  const motivationChoiceFeedback = motivationChallenge?.querySelector("[data-motivation-choice-feedback]");
  const motivationCueStatus = motivationChallenge?.querySelector("[data-motivation-cue-status]");
  const motivationStageLabel = motivationChallenge?.querySelector("[data-motivation-stage-label]");
  const motivationFooterTitle = motivationChallenge?.querySelector("[data-motivation-footer-title]");
  const motivationFooterCopy = motivationChallenge?.querySelector("[data-motivation-footer-copy]");
  const motivationPunchline = motivationStory?.querySelector("[data-motivation-punchline]");
  const motivationDetail = motivationChallenge?.querySelector("[data-motivation-detail]");
  const motivationDetailClose = motivationChallenge?.querySelector("[data-motivation-detail-close]");
  const motivationDetailKicker = motivationChallenge?.querySelector("[data-motivation-detail-kicker]");
  const motivationDetailTitle = motivationChallenge?.querySelector("[data-motivation-detail-title]");
  const motivationDetailTarget = motivationChallenge?.querySelector("[data-motivation-detail-target]");
  const motivationDetailNegative = motivationChallenge?.querySelector("[data-motivation-detail-negative]");
  const motivationDetailNegativeLabel = motivationChallenge?.querySelector("[data-motivation-detail-negative-label]");
  const motivationDetailImage = motivationChallenge?.querySelector("[data-motivation-detail-image]");
  const motivationDetailShared = motivationChallenge?.querySelector("[data-motivation-detail-shared]");
  const motivationDetailDiff = motivationChallenge?.querySelector("[data-motivation-detail-diff]");
  const motivationDetailFigures = motivationChallenge ? [...motivationChallenge.querySelectorAll("[data-detail-focus]")] : [];

  let motivationBeat = 1;
  let motivationIdentityRevealed = false;
  let motivationInspectMode = false;
  let selectedMotivationCandidate = null;
  let pinnedMotivationCue = null;

  function setMotivationBeat(nextBeat, { focus = false } = {}) {
    const parsed = Number.parseInt(nextBeat, 10);
    if (!motivationStory || ![1, 2, 3].includes(parsed)) return;
    motivationBeat = parsed;
    motivationStory.dataset.beat = String(parsed);

    motivationBeats.forEach((beat) => {
      const active = Number.parseInt(beat.dataset.motivationBeat, 10) === parsed;
      beat.classList.toggle("is-active", active);
      beat.setAttribute("aria-pressed", String(active));
      if (active && focus) beat.focus({ preventScroll: true });
    });
    motivationScenes.forEach((scene) => scene.classList.toggle("is-active", Number.parseInt(scene.dataset.motivationScene, 10) === parsed));
  }

  function candidateLabel(key) {
    return motivationCandidates.find((candidate) => candidate.dataset.motivationCandidate === key)?.dataset.candidateLabel || "";
  }

  function setChallengeCopy(state) {
    if (!motivationChallenge) return;
    motivationChallenge.dataset.state = state;

    if (state === "scan") {
      if (motivationStageLabel) motivationStageLabel.textContent = "Which person would you retrieve?";
      if (motivationFooterTitle) motivationFooterTitle.textContent = "All five match the dominant description.";
      if (motivationFooterCopy) motivationFooterCopy.textContent = "Semantic agreement alone does not tell you which identity is correct.";
      if (motivationPunchline) motivationPunchline.innerHTML = "<strong>Semantic agreement leaves multiple plausible candidates.</strong> Choose one, then reveal which retrieval is identity-correct.";
      return;
    }

    if (state === "chosen") {
      const label = candidateLabel(selectedMotivationCandidate);
      if (motivationStageLabel) motivationStageLabel.textContent = "Selection made from semantic cues";
      if (motivationFooterTitle) motivationFooterTitle.textContent = `Candidate ${label} is a plausible retrieval.`;
      if (motivationFooterCopy) motivationFooterCopy.textContent = "But semantic plausibility cannot verify identity.";
      if (motivationPunchline) motivationPunchline.innerHTML = "<strong>A plausible semantic match can still be the wrong identity.</strong> Reveal the labels to test the retrieval.";
      return;
    }

    if (state === "revealed") {
      if (motivationStageLabel) motivationStageLabel.textContent = "Identity labels revealed";
      if (motivationFooterTitle) motivationFooterTitle.textContent = "Five semantic matches. One identity-correct retrieval.";
      if (motivationFooterCopy) motivationFooterCopy.textContent = "The dominant cues stay the same; the identity outcome changes.";
      if (motivationPunchline) motivationPunchline.innerHTML = "<strong>Semantic match ≠ identity match.</strong> Fine-grained evidence must separate the target from identity-wrong look-alikes.";
      return;
    }

    if (state === "inspect") {
      if (motivationStageLabel) motivationStageLabel.textContent = "Inspect the subtle evidence";
      if (motivationFooterTitle) motivationFooterTitle.textContent = "Dominant cues explain plausibility. Smaller cues resolve identity.";
      if (motivationFooterCopy) motivationFooterCopy.textContent = "Hover or click a candidate to inspect the local evidence that changes the identity decision.";
      if (motivationPunchline) motivationPunchline.innerHTML = "<strong>Shared attributes get candidates into the ranking.</strong> Identity-level detail decides which candidate should stay at the top.";
    }
  }

  function setCandidateSelection(key) {
    selectedMotivationCandidate = key;
    motivationCandidates.forEach((candidate) => {
      const selected = candidate.dataset.motivationCandidate === key;
      candidate.classList.toggle("is-selected", selected);
      candidate.classList.toggle("is-active", selected);
      candidate.setAttribute("aria-pressed", String(selected));
    });
  }

  function updateMotivationCue(cue) {
    motivationCueButtons.forEach((button) => {
      const active = !!cue && button.dataset.motivationCue === cue;
      button.classList.toggle("is-cue-active", active);
      button.setAttribute("aria-pressed", String(pinnedMotivationCue === button.dataset.motivationCue));
    });

    motivationCandidates.forEach((candidate) => {
      candidate.classList.toggle("is-cue-shared", !!cue);
      const badge = candidate.querySelector("[data-motivation-cue-badge]");
      if (badge) badge.textContent = cue ? `${cue} · shared` : "";
    });

    if (motivationCueStatus) {
      motivationCueStatus.textContent = cue
        ? `“${cue}” is shared by all five candidates — useful for semantic matching, not enough to resolve identity.`
        : "Hover a cue to see whether it separates the gallery.";
    }
  }

  function renderMotivationCandidate(key, { preview = false } = {}) {
    if (!motivationChallenge || !motivationIdentityRevealed) return;
    const isTarget = key === "target";
    const data = motivationHardNegatives[key];
    if (!isTarget && !data) return;

    if (!preview) setCandidateSelection(key);
    if (!motivationDetail) return;
    motivationDetail.hidden = false;

    if (motivationDetailShared) motivationDetailShared.textContent = motivationSharedCueText;

    if (isTarget) {
      if (motivationDetailKicker) motivationDetailKicker.textContent = "Candidate A · same identity";
      if (motivationDetailTitle) motivationDetailTitle.textContent = "This candidate preserves the identity-consistent local evidence.";
      if (motivationDetailTarget) motivationDetailTarget.textContent = "query cues + identity-consistent local details";
      if (motivationDetailNegative) motivationDetailNegative.textContent = "same image shown for reference";
      if (motivationDetailNegativeLabel) motivationDetailNegativeLabel.textContent = "CANDIDATE A · SAME ID";
      if (motivationDetailDiff) motivationDetailDiff.textContent = "No identity mismatch is exposed here; Candidate A is the same-identity target.";
      if (motivationDetailImage) {
        motivationDetailImage.src = "assets/examples/target.png";
        motivationDetailImage.alt = "True target detail";
      }
      motivationDetailFigures.forEach((figure) => figure.dataset.focusCue = "target");
      return;
    }

    if (motivationDetailKicker) motivationDetailKicker.textContent = data.label;
    if (motivationDetailTitle) motivationDetailTitle.textContent = data.title;
    if (motivationDetailTarget) motivationDetailTarget.textContent = data.target;
    if (motivationDetailNegative) motivationDetailNegative.textContent = data.negative;
    if (motivationDetailNegativeLabel) motivationDetailNegativeLabel.textContent = data.negativeLabel;
    if (motivationDetailDiff) motivationDetailDiff.textContent = data.difference;
    if (motivationDetailImage) {
      motivationDetailImage.src = data.image;
      motivationDetailImage.alt = `${data.label} detail`;
    }
    motivationDetailFigures.forEach((figure) => figure.dataset.focusCue = data.focus);
  }

  function setMotivationInspectMode(enabled, { candidate = null } = {}) {
    if (!motivationChallenge || !motivationIdentityRevealed) return;
    motivationInspectMode = !!enabled;
    motivationChallenge.classList.toggle("is-inspecting", motivationInspectMode);

    if (motivationInspectMode) {
      const fallback = candidate || selectedMotivationCandidate || "hn1";
      if (motivationRevealButton) motivationRevealButton.textContent = "Hide cue inspection";
      setChallengeCopy("inspect");
      renderMotivationCandidate(fallback, { preview: !selectedMotivationCandidate && !candidate });
    } else {
      if (motivationRevealButton) motivationRevealButton.textContent = "Inspect subtle cues →";
      if (motivationDetail) motivationDetail.hidden = true;
      setChallengeCopy("revealed");
    }
  }

  function setMotivationReveal(revealed) {
    if (!motivationStory || !motivationChallenge) return;
    motivationIdentityRevealed = !!revealed;
    motivationStory.classList.toggle("identities-revealed", motivationIdentityRevealed);
    motivationChallenge.classList.toggle("identities-revealed", motivationIdentityRevealed);

    if (motivationRevealButton) {
      motivationRevealButton.textContent = motivationIdentityRevealed ? "Inspect subtle cues →" : "Reveal identities";
      motivationRevealButton.setAttribute("aria-pressed", String(motivationIdentityRevealed));
    }
    if (motivationResetButton) motivationResetButton.hidden = !motivationIdentityRevealed && !selectedMotivationCandidate;

    if (motivationIdentityRevealed) {
      motivationInspectMode = false;
      motivationChallenge.classList.remove("is-inspecting");
      if (motivationChoiceFeedback) {
        motivationChoiceFeedback.innerHTML = selectedMotivationCandidate
          ? `<span class="motivation-choice-dot-v7" aria-hidden="true"></span><p><strong>Candidate ${candidateLabel(selectedMotivationCandidate)} checked.</strong> The gallery reveals one same-ID target and four identity-wrong look-alikes.</p>`
          : '<span class="motivation-choice-dot-v7" aria-hidden="true"></span><p><strong>Identity labels revealed.</strong> Candidate A is the same identity; B–E remain semantically plausible but are identity-wrong.</p>';
      }
      setChallengeCopy("revealed");
      return;
    }

    motivationInspectMode = false;
    motivationChallenge.classList.remove("is-inspecting");
    if (motivationDetail) motivationDetail.hidden = true;
    setChallengeCopy(selectedMotivationCandidate ? "chosen" : "scan");
  }

  function resetMotivationChallenge() {
    motivationIdentityRevealed = false;
    motivationInspectMode = false;
    selectedMotivationCandidate = null;
    pinnedMotivationCue = null;
    motivationStory?.classList.remove("identities-revealed");
    motivationChallenge?.classList.remove("identities-revealed", "is-inspecting");
    motivationCandidates.forEach((candidate) => {
      candidate.classList.remove("is-selected", "is-active", "is-preview", "is-cue-shared");
      candidate.setAttribute("aria-pressed", "false");
      const badge = candidate.querySelector("[data-motivation-cue-badge]");
      if (badge) badge.textContent = "";
    });
    motivationCueButtons.forEach((button) => {
      button.classList.remove("is-cue-active");
      button.setAttribute("aria-pressed", "false");
    });
    if (motivationCueStatus) motivationCueStatus.textContent = "Hover a cue to see whether it separates the gallery.";
    if (motivationDetail) motivationDetail.hidden = true;
    if (motivationRevealButton) {
      motivationRevealButton.textContent = "Reveal identities";
      motivationRevealButton.setAttribute("aria-pressed", "false");
    }
    if (motivationResetButton) motivationResetButton.hidden = true;
    if (motivationChoiceFeedback) motivationChoiceFeedback.innerHTML = '<span class="motivation-choice-dot-v7" aria-hidden="true"></span><p><strong>Try the retrieval yourself.</strong> Pick the person you think the text describes best, or reveal the identities directly.</p>';
    setChallengeCopy("scan");
  }

  motivationCueButtons.forEach((button) => {
    const cue = button.dataset.motivationCue;
    button.addEventListener("pointerenter", () => updateMotivationCue(cue));
    button.addEventListener("pointerleave", () => updateMotivationCue(pinnedMotivationCue));
    button.addEventListener("focus", () => updateMotivationCue(cue));
    button.addEventListener("blur", () => updateMotivationCue(pinnedMotivationCue));
    button.addEventListener("click", () => {
      pinnedMotivationCue = pinnedMotivationCue === cue ? null : cue;
      updateMotivationCue(pinnedMotivationCue);
    });
  });

  motivationCandidates.forEach((candidate, index) => {
    const key = candidate.dataset.motivationCandidate;
    candidate.addEventListener("click", () => {
      if (!motivationIdentityRevealed) {
        setCandidateSelection(key);
        if (motivationResetButton) motivationResetButton.hidden = false;
        if (motivationChoiceFeedback) motivationChoiceFeedback.innerHTML = `<span class="motivation-choice-dot-v7" aria-hidden="true"></span><p><strong>Candidate ${candidateLabel(key)} selected.</strong> At the dominant-cue level, this is a defensible match. Reveal identities to check it.</p>`;
        setChallengeCopy("chosen");
        return;
      }

      if (!motivationInspectMode) setMotivationInspectMode(true, { candidate: key });
      else renderMotivationCandidate(key);
    });

    candidate.addEventListener("pointerenter", () => {
      if (motivationIdentityRevealed && motivationInspectMode) renderMotivationCandidate(key, { preview: true });
    });
    candidate.addEventListener("pointerleave", () => {
      if (!motivationIdentityRevealed || !motivationInspectMode) return;
      renderMotivationCandidate(selectedMotivationCandidate || "hn1", { preview: true });
    });
    candidate.addEventListener("focus", () => {
      if (motivationIdentityRevealed && motivationInspectMode) renderMotivationCandidate(key, { preview: true });
    });
    candidate.addEventListener("blur", () => {
      if (!motivationIdentityRevealed || !motivationInspectMode) return;
      renderMotivationCandidate(selectedMotivationCandidate || "hn1", { preview: true });
    });
    candidate.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      motivationCandidates[(index + delta + motivationCandidates.length) % motivationCandidates.length].focus();
    });
  });

  motivationRevealButton?.addEventListener("click", () => {
    if (!motivationIdentityRevealed) setMotivationReveal(true);
    else setMotivationInspectMode(!motivationInspectMode);
  });
  motivationResetButton?.addEventListener("click", resetMotivationChallenge);
  motivationDetailClose?.addEventListener("click", () => setMotivationInspectMode(false));

  const motivationDesktop = window.matchMedia("(min-width: 981px)");
  const motivationReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let motivationScrollFrame = 0;

  function getMotivationScrollAnchor() {
    const navHeight = document.querySelector(".site-nav")?.getBoundingClientRect().height || 0;
    const usable = Math.max(0, window.innerHeight - navHeight);
    return navHeight + usable * 0.46;
  }

  function syncMotivationBeatFromScroll() {
    motivationScrollFrame = 0;
    if (!motivationStory || !motivationBeats.length || !motivationDesktop.matches) return;

    const anchor = getMotivationScrollAnchor();
    let bestBeat = motivationBeats[0];
    let bestDistance = Number.POSITIVE_INFINITY;

    motivationBeats.forEach((beat) => {
      const rect = beat.getBoundingClientRect();
      const distance = rect.top <= anchor && rect.bottom >= anchor
        ? 0
        : Math.abs((rect.top + rect.bottom) / 2 - anchor);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestBeat = beat;
      }
    });

    setMotivationBeat(bestBeat.dataset.motivationBeat);
  }

  function scheduleMotivationScrollSync() {
    if (motivationScrollFrame) return;
    motivationScrollFrame = window.requestAnimationFrame(syncMotivationBeatFromScroll);
  }

  motivationBeats.forEach((beat, index) => {
    beat.addEventListener("click", () => {
      setMotivationBeat(beat.dataset.motivationBeat);
      if (motivationDesktop.matches) {
        beat.scrollIntoView({
          behavior: motivationReduceMotion ? "auto" : "smooth",
          block: "center"
        });
      }
    });
    beat.addEventListener("keydown", (event) => {
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const forward = ["ArrowDown", "ArrowRight"].includes(event.key);
      const next = motivationBeats[(index + (forward ? 1 : -1) + motivationBeats.length) % motivationBeats.length];
      setMotivationBeat(next.dataset.motivationBeat, { focus: true });
      if (motivationDesktop.matches) {
        next.scrollIntoView({
          behavior: motivationReduceMotion ? "auto" : "smooth",
          block: "center"
        });
      }
    });
  });

  // Compact two-slide motivation deck. Vertical page scrolling remains untouched;
  // users move through the story with the tabs or previous/next controls.
  const motivationDeck = document.querySelector("[data-motivation-deck]");
  const motivationSlides = motivationDeck ? [...motivationDeck.querySelectorAll("[data-motivation-slide]")] : [];
  const motivationSlideTabs = motivationDeck ? [...motivationDeck.querySelectorAll("[data-motivation-slide-tab]")] : [];
  const motivationPrev = motivationDeck?.querySelector("[data-motivation-prev]");
  const motivationNext = motivationDeck?.querySelector("[data-motivation-next]");
  const motivationCurrent = motivationDeck?.querySelector("[data-motivation-current]");
  let activeMotivationSlide = 0;

  function setMotivationSlide(index, { focusTab = false } = {}) {
    if (!motivationDeck || !motivationSlides.length) return;
    const nextIndex = Math.max(0, Math.min(motivationSlides.length - 1, Number(index) || 0));
    const previousIndex = activeMotivationSlide;
    motivationDeck.dataset.slideDirection = nextIndex < previousIndex ? "backward" : "forward";
    activeMotivationSlide = nextIndex;

    motivationSlides.forEach((slide, slideIndex) => {
      const active = slideIndex === nextIndex;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
      slide.toggleAttribute("inert", !active);
    });

    motivationSlideTabs.forEach((tab, tabIndex) => {
      const active = tabIndex === nextIndex;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focusTab) tab.focus({ preventScroll: true });
    });

    if (motivationCurrent) motivationCurrent.textContent = String(nextIndex + 1).padStart(2, "0");
    if (motivationPrev) motivationPrev.disabled = nextIndex === 0;
    if (motivationNext) motivationNext.disabled = nextIndex === motivationSlides.length - 1;
    if (nextIndex === 1) scheduleSupervisionDemo();

    // Keep cue inspection local to slide 01 while preserving the user's retrieval choice.
    if (nextIndex !== 0 && motivationInspectMode) {
      setMotivationInspectMode(false);
    }
  }

  motivationSlideTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => setMotivationSlide(index));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + motivationSlideTabs.length) % motivationSlideTabs.length;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % motivationSlideTabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = motivationSlideTabs.length - 1;
      setMotivationSlide(nextIndex, { focusTab: true });
    });
  });

  motivationPrev?.addEventListener("click", () => setMotivationSlide(activeMotivationSlide - 1));
  motivationNext?.addEventListener("click", () => setMotivationSlide(activeMotivationSlide + 1));

  // Slide 02: make the supervision gap visible instead of only describing it.
  const supervisionDemo = motivationDeck?.querySelector("[data-supervision-demo]");
  const supervisionReplay = supervisionDemo?.querySelector("[data-supervision-replay]");
  const supervisionSteps = supervisionDemo ? [...supervisionDemo.querySelectorAll("[data-supervision-step]")] : [];
  const supervisionMemorySlots = supervisionDemo ? [...supervisionDemo.querySelectorAll("[data-supervision-memory-slot]")] : [];
  const supervisionDemoStatus = supervisionDemo?.querySelector("[data-supervision-demo-status]");
  const supervisionFeatureCards = motivationDeck ? [...motivationDeck.querySelectorAll("[data-supervision-feature]")] : [];
  const supervisionFeatureCopy = motivationDeck?.querySelector("[data-supervision-feature-copy]");
  const supervisionDefaultFeatureCopy = "Useful supervision is not missing. Hover or select a card to inspect what the identity label already provides.";
  let supervisionTimers = [];
  let supervisionHasPlayed = false;
  let pinnedSupervisionFeature = null;

  function clearSupervisionTimers() {
    supervisionTimers.forEach((timer) => window.clearTimeout(timer));
    supervisionTimers = [];
  }

  function resetSupervisionMemorySlots() {
    supervisionMemorySlots.forEach((slot) => {
      slot.classList.remove("is-sampling", "is-cleared");
      const marker = slot.querySelector("i");
      const label = slot.querySelector("small");
      if (marker) marker.textContent = "·";
      if (label) label.textContent = "empty";
    });
  }

  function setSupervisionDemoStep(index) {
    if (!supervisionDemo) return;
    supervisionDemo.dataset.phase = `step-${index + 1}`;
    supervisionSteps.forEach((step, stepIndex) => {
      step.classList.toggle("is-current", stepIndex === index);
      step.classList.toggle("is-past", stepIndex < index);
    });

    supervisionMemorySlots.forEach((slot, slotIndex) => {
      slot.classList.remove("is-sampling", "is-cleared");
      const marker = slot.querySelector("i");
      const label = slot.querySelector("small");
      if (slotIndex === index) {
        slot.classList.add("is-sampling");
        if (marker) marker.textContent = supervisionSteps[index]?.dataset.evidence || "evidence";
        if (label) label.textContent = "observed now";
      } else {
        if (marker) marker.textContent = "·";
        if (label) label.textContent = "empty";
      }
    });

    if (supervisionDemoStatus) {
      supervisionDemoStatus.textContent = `t${index + 1}: ID 17 remains explicit; the current observation contributes ${supervisionSteps[index]?.dataset.evidence || "new evidence"} to this update.`;
    }
  }

  function completeSupervisionDemo() {
    if (!supervisionDemo) return;
    supervisionDemo.dataset.phase = "complete";
    supervisionSteps.forEach((step) => {
      step.classList.remove("is-current");
      step.classList.add("is-past");
    });
    supervisionMemorySlots.forEach((slot, index) => {
      slot.classList.remove("is-sampling");
      slot.classList.add("is-cleared");
      const marker = slot.querySelector("i");
      const label = slot.querySelector("small");
      if (marker) marker.textContent = "·";
      if (label) label.textContent = "empty";
      supervisionTimers.push(window.setTimeout(() => slot.classList.remove("is-cleared"), 460 + index * 40));
    });
    if (supervisionDemoStatus) supervisionDemoStatus.innerHTML = "<strong>The label survived all three updates.</strong> No observation-derived identity reference was explicitly carried forward.";
    if (supervisionReplay) {
      supervisionReplay.disabled = false;
      supervisionReplay.innerHTML = '<span aria-hidden="true">↻</span> Replay training';
    }
    supervisionHasPlayed = true;
  }

  function runSupervisionDemo() {
    if (!supervisionDemo || !supervisionSteps.length) return;
    clearSupervisionTimers();
    supervisionDemo.dataset.phase = "idle";
    supervisionSteps.forEach((step) => step.classList.remove("is-current", "is-past"));
    resetSupervisionMemorySlots();
    if (supervisionReplay) {
      supervisionReplay.disabled = true;
      supervisionReplay.innerHTML = '<span aria-hidden="true">●</span> Training…';
    }
    if (supervisionDemoStatus) supervisionDemoStatus.textContent = "Follow ID 17 as heterogeneous observations arrive over time.";

    if (motivationReduceMotion) {
      completeSupervisionDemo();
      return;
    }

    const delays = [260, 1240, 2220];
    delays.forEach((delay, index) => {
      supervisionTimers.push(window.setTimeout(() => setSupervisionDemoStep(index), delay));
    });
    supervisionTimers.push(window.setTimeout(completeSupervisionDemo, 3280));
  }

  function scheduleSupervisionDemo() {
    if (!supervisionDemo || supervisionHasPlayed) return;
    clearSupervisionTimers();
    supervisionTimers.push(window.setTimeout(runSupervisionDemo, motivationReduceMotion ? 0 : 340));
  }

  function setSupervisionFeature(card, pinned = false) {
    if (!supervisionFeatureCopy) return;
    supervisionFeatureCards.forEach((item) => item.setAttribute("aria-pressed", String(pinned && item === card)));
    supervisionFeatureCopy.textContent = card?.dataset.description || supervisionDefaultFeatureCopy;
  }

  supervisionFeatureCards.forEach((card) => {
    card.addEventListener("pointerenter", () => setSupervisionFeature(card, false));
    card.addEventListener("pointerleave", () => setSupervisionFeature(pinnedSupervisionFeature, !!pinnedSupervisionFeature));
    card.addEventListener("focus", () => setSupervisionFeature(card, false));
    card.addEventListener("blur", () => setSupervisionFeature(pinnedSupervisionFeature, !!pinnedSupervisionFeature));
    card.addEventListener("click", () => {
      pinnedSupervisionFeature = pinnedSupervisionFeature === card ? null : card;
      setSupervisionFeature(pinnedSupervisionFeature, !!pinnedSupervisionFeature);
    });
  });

  supervisionReplay?.addEventListener("click", runSupervisionDemo);
  if (motivationDeck && motivationSlides.length) setMotivationSlide(0);

  // Motivation takeaway: turn the missing persistent reference into a short temporal story.
  const motivationTakeaway = document.querySelector("[data-motivation-takeaway]");
  const motivationTakeawaySteps = motivationTakeaway ? [...motivationTakeaway.querySelectorAll("[data-motivation-takeaway-step]")] : [];
  const motivationTakeawayReplay = motivationTakeaway?.querySelector("[data-motivation-takeaway-replay]");
  const motivationTakeawayStatus = motivationTakeaway?.querySelector("[data-motivation-takeaway-status]");
  let motivationTakeawayTimers = [];
  let motivationTakeawayHasPlayed = false;

  function clearMotivationTakeawayTimers() {
    motivationTakeawayTimers.forEach((timer) => window.clearTimeout(timer));
    motivationTakeawayTimers = [];
  }

  function setMotivationTakeawayStep(index) {
    if (!motivationTakeaway) return;
    motivationTakeaway.dataset.state = `step-${index + 1}`;
    motivationTakeawaySteps.forEach((step, stepIndex) => {
      step.classList.toggle("is-current", stepIndex === index);
      step.classList.toggle("is-past", stepIndex < index);
    });
    if (motivationTakeawayStatus) {
      motivationTakeawayStatus.textContent = `t${index + 1}: new evidence from ID 17 is carried into the same persistent reference.`;
    }
  }

  function completeMotivationTakeaway() {
    if (!motivationTakeaway) return;
    motivationTakeaway.dataset.state = "complete";
    motivationTakeawaySteps.forEach((step) => {
      step.classList.remove("is-current");
      step.classList.add("is-past");
    });
    if (motivationTakeawayStatus) {
      motivationTakeawayStatus.innerHTML = "<strong>Requirement established:</strong> keep an explicit observation-derived identity reference available across mini-batches.";
    }
    if (motivationTakeawayReplay) {
      motivationTakeawayReplay.disabled = false;
      motivationTakeawayReplay.innerHTML = '<span aria-hidden="true">↻</span> Replay accumulation';
    }
    motivationTakeawayHasPlayed = true;
  }

  function runMotivationTakeaway() {
    if (!motivationTakeaway || !motivationTakeawaySteps.length) return;
    clearMotivationTakeawayTimers();
    motivationTakeaway.dataset.state = "idle";
    motivationTakeawaySteps.forEach((step) => step.classList.remove("is-current", "is-past"));
    if (motivationTakeawayReplay) {
      motivationTakeawayReplay.disabled = true;
      motivationTakeawayReplay.innerHTML = '<span aria-hidden="true">●</span> Accumulating…';
    }
    if (motivationTakeawayStatus) motivationTakeawayStatus.textContent = "Watch three observations of ID 17 arrive across mini-batches.";

    if (motivationReduceMotion) {
      completeMotivationTakeaway();
      return;
    }

    [260, 1030, 1800].forEach((delay, index) => {
      motivationTakeawayTimers.push(window.setTimeout(() => setMotivationTakeawayStep(index), delay));
    });
    motivationTakeawayTimers.push(window.setTimeout(completeMotivationTakeaway, 2700));
  }

  motivationTakeawayReplay?.addEventListener("click", runMotivationTakeaway);

  if (motivationTakeaway && "IntersectionObserver" in window) {
    const motivationTakeawayObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || motivationTakeawayHasPlayed) return;
        observer.unobserve(entry.target);
        motivationTakeawayTimers.push(window.setTimeout(runMotivationTakeaway, motivationReduceMotion ? 0 : 220));
      });
    }, { threshold: .42 });
    motivationTakeawayObserver.observe(motivationTakeaway);
  } else if (motivationTakeaway) {
    runMotivationTakeaway();
  }

  if (motivationStory && motivationBeats.length) {
    setMotivationBeat(1);
    setMotivationReveal(false);
    syncMotivationBeatFromScroll();
    window.addEventListener("scroll", scheduleMotivationScrollSync, { passive: true });
    window.addEventListener("resize", scheduleMotivationScrollSync);
    motivationDesktop.addEventListener?.("change", scheduleMotivationScrollSync);
    if (document.fonts?.ready) document.fonts.ready.then(scheduleMotivationScrollSync).catch(() => {});
  }

  const methodReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const iaprArchitecture = document.querySelector("[data-iapr-architecture]");
  const iaprModeButtons = iaprArchitecture ? [...iaprArchitecture.querySelectorAll("[data-iapr-mode]")] : [];
  const iaprTrainingBranch = iaprArchitecture?.querySelector("[data-iapr-training-branch]");

  function setIaprMode(mode, focusButton = false) {
    if (!iaprArchitecture || !["training", "inference"].includes(mode)) return;
    iaprArchitecture.dataset.mode = mode;
    document.querySelector("#method")?.setAttribute("data-method-mode", mode);
    iaprTrainingBranch?.setAttribute("aria-hidden", String(mode === "inference"));
    iaprTrainingBranch?.toggleAttribute("inert", mode === "inference");

    iaprModeButtons.forEach((button) => {
      const selected = button.dataset.iaprMode === mode;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && focusButton) button.focus({ preventScroll: true });
    });

    if (!methodReduceMotion) {
      iaprArchitecture.classList.remove("is-mode-changing");
      void iaprArchitecture.offsetWidth;
      iaprArchitecture.classList.add("is-mode-changing");
      window.setTimeout(() => iaprArchitecture?.classList.remove("is-mode-changing"), 520);
    }
  }

  iaprModeButtons.forEach((button, index) => {
    button.addEventListener("click", () => setIaprMode(button.dataset.iaprMode));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const next = iaprModeButtons[(index + delta + iaprModeButtons.length) % iaprModeButtons.length];
      setIaprMode(next.dataset.iaprMode, true);
    });
  });

  if (iaprArchitecture) setIaprMode("training");

  // Method v10: user-controlled horizontal walkthrough.
  // Each slide replays a short semantic animation when it becomes active.
  const methodSlider = document.querySelector("[data-method-slider]");
  const methodSliderTrack = methodSlider?.querySelector("[data-method-slider-track]");
  const methodSliderWindow = methodSlider?.querySelector("[data-method-slider-window]");
  const methodSlides = methodSlider ? [...methodSlider.querySelectorAll("[data-method-slide]")] : [];
  const methodSlideTabs = methodSlider ? [...methodSlider.querySelectorAll("[data-method-slide-tab]")] : [];
  const methodPrev = methodSlider?.querySelector("[data-method-prev]");
  const methodNext = methodSlider?.querySelector("[data-method-next]");
  const methodCurrent = methodSlider?.querySelector("[data-method-current]");
  const methodReplay = methodSlider?.querySelector("[data-method-replay]");
  let activeMethodSlide = 0;
  let methodPointerStartX = null;
  let methodPointerStartY = null;

  function replayMethodSlide() {
    const slide = methodSlides[activeMethodSlide];
    if (!slide || methodReduceMotion) return;
    slide.classList.remove("is-active");
    void slide.offsetWidth;
    window.requestAnimationFrame(() => slide.classList.add("is-active"));
  }

  function setMethodSlide(index, { focusTab = false, replay = true } = {}) {
    if (!methodSlider || !methodSliderTrack || !methodSlides.length) return;
    const nextIndex = Math.max(0, Math.min(methodSlides.length - 1, Number(index) || 0));
    activeMethodSlide = nextIndex;
    methodSlider.dataset.slide = String(nextIndex);
    methodSliderTrack.style.transform = `translate3d(-${nextIndex * 100}%, 0, 0)`;

    methodSlides.forEach((slide, slideIndex) => {
      const active = slideIndex === nextIndex;
      slide.classList.remove("is-active");
      slide.setAttribute("aria-hidden", String(!active));
      slide.toggleAttribute("inert", !active);
    });

    methodSlideTabs.forEach((tab, tabIndex) => {
      const active = tabIndex === nextIndex;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focusTab) tab.focus({ preventScroll: true });
    });

    if (methodCurrent) methodCurrent.textContent = String(nextIndex + 1).padStart(2, "0");
    if (methodPrev) methodPrev.disabled = nextIndex === 0;
    if (methodNext) methodNext.disabled = nextIndex === methodSlides.length - 1;

    const activeSlide = methodSlides[nextIndex];
    window.requestAnimationFrame(() => {
      activeSlide?.classList.add("is-active");
      if (replay && methodSlider.classList.contains("is-inview") && !methodReduceMotion) {
        // Re-adding is-active in the next frame restarts the stage animation.
        activeSlide?.classList.remove("is-active");
        void activeSlide?.offsetWidth;
        window.requestAnimationFrame(() => activeSlide?.classList.add("is-active"));
      }
    });
  }

  const methodExplorer = document.querySelector("[data-method-explorer]");
  const methodExploreToggle = document.querySelector("[data-method-explore-toggle]");
  const methodExploreLabel = methodExploreToggle?.querySelector("[data-method-explore-label]");
  const methodOpenButtons = [...document.querySelectorAll("[data-method-open]")];
  const methodStageIndex = { project: 0, remember: 1, translate: 2, regularize: 3 };
  let methodExplorerOpen = false;

  function syncMethodExplorerControls() {
    methodExploreToggle?.setAttribute("aria-expanded", String(methodExplorerOpen));
    methodOpenButtons.forEach((button) => button.setAttribute("aria-expanded", String(methodExplorerOpen)));
    if (methodExploreLabel) methodExploreLabel.textContent = methodExplorerOpen ? "Hide details" : "Explore IAPR";
    const icon = methodExploreToggle?.querySelector("i");
    if (icon) icon.textContent = methodExplorerOpen ? "↑" : "↓";
  }

  function openMethodExplorer(stage = "project", { scroll = false, focusTab = false } = {}) {
    if (!methodExplorer) return;
    methodExplorerOpen = true;
    methodExplorer.classList.remove("is-collapsed");
    methodExplorer.classList.add("is-open");
    methodExplorer.setAttribute("aria-hidden", "false");
    methodExplorer.removeAttribute("inert");
    syncMethodExplorerControls();
    const index = methodStageIndex[stage] ?? 0;
    setMethodSlide(index, { focusTab, replay: true });

    if (scroll) {
      window.requestAnimationFrame(() => {
        const navHeight = document.querySelector(".site-nav")?.getBoundingClientRect().height || 0;
        const top = methodExplorer.getBoundingClientRect().top + window.scrollY - navHeight - 18;
        window.scrollTo({ top, behavior: methodReduceMotion ? "auto" : "smooth" });
      });
    }
  }

  function closeMethodExplorer() {
    if (!methodExplorer) return;
    methodExplorerOpen = false;
    methodExplorer.classList.remove("is-open");
    methodExplorer.classList.add("is-collapsed");
    methodExplorer.setAttribute("aria-hidden", "true");
    methodExplorer.setAttribute("inert", "");
    syncMethodExplorerControls();
  }

  methodExploreToggle?.addEventListener("click", () => {
    if (methodExplorerOpen) closeMethodExplorer();
    else openMethodExplorer("project", { scroll: false });
  });

  methodOpenButtons.forEach((button) => {
    button.addEventListener("click", () => openMethodExplorer(button.dataset.methodOpen || "project", { scroll: true }));
  });

  syncMethodExplorerControls();

  methodSlideTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => setMethodSlide(index));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + methodSlideTabs.length) % methodSlideTabs.length;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % methodSlideTabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = methodSlideTabs.length - 1;
      setMethodSlide(nextIndex, { focusTab: true });
    });
  });

  methodPrev?.addEventListener("click", () => setMethodSlide(activeMethodSlide - 1));
  methodNext?.addEventListener("click", () => setMethodSlide(activeMethodSlide + 1));
  methodReplay?.addEventListener("click", replayMethodSlide);

  methodSliderWindow?.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    methodPointerStartX = event.clientX;
    methodPointerStartY = event.clientY;
    methodSliderWindow.classList.add("is-pointer-down");
    methodSliderWindow.setPointerCapture?.(event.pointerId);
  });

  methodSliderWindow?.addEventListener("pointerup", (event) => {
    if (methodPointerStartX == null || methodPointerStartY == null) return;
    const dx = event.clientX - methodPointerStartX;
    const dy = event.clientY - methodPointerStartY;
    methodPointerStartX = null;
    methodPointerStartY = null;
    methodSliderWindow.classList.remove("is-pointer-down");
    if (Math.abs(dx) < 46 || Math.abs(dx) <= Math.abs(dy) * 1.15) return;
    if (dx < 0) setMethodSlide(activeMethodSlide + 1);
    else setMethodSlide(activeMethodSlide - 1);
  });

  methodSliderWindow?.addEventListener("pointercancel", () => {
    methodPointerStartX = null;
    methodPointerStartY = null;
    methodSliderWindow.classList.remove("is-pointer-down");
  });

  if (methodSlider) {
    setMethodSlide(0, { replay: false });
    if ("IntersectionObserver" in window) {
      const methodObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          methodSlider.classList.add("is-inview");
          replayMethodSlide();
          observer.unobserve(entry.target);
        });
      }, { threshold: .32 });
      methodObserver.observe(methodSlider);
    } else {
      methodSlider.classList.add("is-inview");
    }
  }

  // Training lifecycle: teach the two-phase schedule and repeated active-stage loop.
  const trainingLifecycle = document.querySelector("[data-training-lifecycle]");
  const trainingReplay = trainingLifecycle?.querySelector("[data-training-replay]");
  const trainingStatus = trainingLifecycle?.querySelector("[data-training-status]");
  let trainingLifecycleTimer = null;
  let trainingLifecycleHasPlayed = false;

  function finishTrainingLifecycle() {
    if (!trainingLifecycle) return;
    trainingLifecycle.classList.remove("is-playing");
    trainingLifecycle.classList.add("is-complete");
    trainingLifecycle.dataset.state = "complete";
    if (trainingStatus) trainingStatus.innerHTML = "<strong>Deployment unchanged:</strong> the IAPR branch is discarded; inference uses the base retriever’s original scoring function.";
    if (trainingReplay) {
      trainingReplay.disabled = false;
      trainingReplay.innerHTML = '<span aria-hidden="true">↻</span> Replay';
    }
    trainingLifecycleHasPlayed = true;
  }

  function runTrainingLifecycle() {
    if (!trainingLifecycle) return;
    if (trainingLifecycleTimer) window.clearTimeout(trainingLifecycleTimer);
    trainingLifecycle.classList.remove("is-playing", "is-complete");
    trainingLifecycle.dataset.state = "idle";
    void trainingLifecycle.offsetWidth;

    if (trainingReplay) {
      trainingReplay.disabled = true;
      trainingReplay.innerHTML = '<span aria-hidden="true">●</span> Playing';
    }
    if (trainingStatus) trainingStatus.textContent = "Warm-up → activate at epoch 6 → repeat the active mini-batch loop → remove IAPR for inference.";

    if (methodReduceMotion) {
      finishTrainingLifecycle();
      return;
    }

    trainingLifecycle.classList.add("is-playing");
    trainingLifecycle.dataset.state = "playing";
    trainingLifecycleTimer = window.setTimeout(finishTrainingLifecycle, 5600);
  }

  trainingReplay?.addEventListener("click", runTrainingLifecycle);

  if (trainingLifecycle && "IntersectionObserver" in window) {
    const trainingLifecycleObserver = new IntersectionObserver((entries, observer) => {
      if (!entries.some((entry) => entry.isIntersecting) || trainingLifecycleHasPlayed) return;
      observer.disconnect();
      window.setTimeout(runTrainingLifecycle, methodReduceMotion ? 0 : 220);
    }, { threshold: .28 });
    trainingLifecycleObserver.observe(trainingLifecycle);
  } else if (trainingLifecycle) {
    runTrainingLifecycle();
  }

  // Results: turn the main table into an interactive paired-comparison explorer.
  const resultData = {
    clip: {
      label: "CLIP",
      cuhk: { r1: { base: 71.56, iapr: 72.09 }, map: { base: 64.36, iapr: 64.54 } },
      icfg: { r1: { base: 61.60, iapr: 62.99 }, map: { base: 38.00, iapr: 39.31 } },
      rstp: { r1: { base: 62.60, iapr: 63.25 }, map: { base: 49.78, iapr: 49.90 } }
    },
    irra: {
      label: "IRRA",
      cuhk: { r1: { base: 68.53, iapr: 68.91 }, map: { base: 62.60, iapr: 63.07 } },
      icfg: { r1: { base: 57.90, iapr: 58.74 }, map: { base: 36.72, iapr: 37.83 } },
      rstp: { r1: { base: 59.25, iapr: 60.70 }, map: { base: 48.79, iapr: 48.91 } }
    },
    rde: {
      label: "RDE",
      cuhk: { r1: { base: 71.09, iapr: 71.86 }, map: { base: 64.45, iapr: 65.41 } },
      icfg: { r1: { base: 63.66, iapr: 64.25 }, map: { base: 40.57, iapr: 42.02 } },
      rstp: { r1: { base: 57.75, iapr: 61.10 }, map: { base: 46.53, iapr: 48.43 } }
    },
    "dm-adapter": {
      label: "DM-Adapter",
      cuhk: { r1: { base: 68.23, iapr: 69.38 }, map: { base: 63.21, iapr: 63.83 } },
      icfg: { r1: { base: 58.42, iapr: 59.57 }, map: { base: 37.51, iapr: 38.59 } },
      rstp: { r1: { base: 58.45, iapr: 59.65 }, map: { base: 47.33, iapr: 47.85 } }
    },
    itself: {
      label: "ITSELF",
      cuhk: { r1: { base: 74.55, iapr: 75.13 }, map: { base: 67.31, iapr: 67.56 } },
      icfg: { r1: { base: 67.23, iapr: 67.88 }, map: { base: 42.43, iapr: 43.60 } },
      rstp: { r1: { base: 66.60, iapr: 68.20 }, map: { base: 53.60, iapr: 54.06 } }
    }
  };

  const resultDatasets = {
    cuhk: "CUHK-PEDES",
    icfg: "ICFG-PEDES",
    rstp: "RSTPReid"
  };
  const resultModelOrder = ["clip", "irra", "rde", "dm-adapter", "itself"];
  const resultDatasetOrder = ["cuhk", "icfg", "rstp"];
  const resultMetricLabels = { r1: "R@1", map: "mAP" };
  const resultExplorer = document.querySelector("[data-result-explorer]");
  const resultMatrix = resultExplorer?.querySelector("[data-result-matrix]");
  const resultMetricButtons = resultExplorer ? [...resultExplorer.querySelectorAll("[data-result-metric]")] : [];
  const resultDetail = resultExplorer?.querySelector("[data-result-detail]");
  const resultDetailTitle = resultDetail?.querySelector("[data-result-detail-title]");
  const resultDetailActiveGain = resultDetail?.querySelector("[data-result-detail-active-gain]");
  const resultDetailCopy = resultDetail?.querySelector("[data-result-detail-copy]");
  const resultsReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeResultMetric = "r1";
  let selectedResult = { model: "rde", dataset: "rstp" };

  function resultGain(modelKey, datasetKey, metric) {
    const entry = resultData[modelKey]?.[datasetKey]?.[metric];
    return entry ? entry.iapr - entry.base : 0;
  }

  function formatSigned(value) {
    if (Math.abs(value) < .005) return "0.00";
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}`;
  }

  function maxGainForMetric(metric) {
    return Math.max(...resultModelOrder.flatMap((modelKey) => resultDatasetOrder.map((datasetKey) => resultGain(modelKey, datasetKey, metric))));
  }

  function applyResultContext(modelKey, datasetKey) {
    if (!resultMatrix) return;
    resultMatrix.querySelectorAll("[data-result-row]").forEach((node) => {
      node.classList.toggle("is-context", node.dataset.resultRow === modelKey);
    });
    resultMatrix.querySelectorAll("[data-result-col]").forEach((node) => {
      node.classList.toggle("is-context", node.dataset.resultCol === datasetKey);
    });
    resultMatrix.querySelectorAll("[data-result-cell]").forEach((node) => {
      const sameRow = node.dataset.resultModel === modelKey;
      const sameCol = node.dataset.resultDataset === datasetKey;
      const selected = node.dataset.resultModel === selectedResult.model && node.dataset.resultDataset === selectedResult.dataset;
      node.classList.toggle("is-context", sameRow || sameCol);
      node.classList.toggle("is-selected", selected);
      node.setAttribute("aria-pressed", String(selected));
    });
  }

  function updateResultDetail(modelKey, datasetKey) {
    if (!resultDetail || !resultData[modelKey]?.[datasetKey]) return;
    const model = resultData[modelKey];
    const datasetLabel = resultDatasets[datasetKey];
    const setting = model[datasetKey];
    const activeGain = resultGain(modelKey, datasetKey, activeResultMetric);

    if (resultDetailTitle) resultDetailTitle.textContent = `${model.label} × ${datasetLabel}`;
    if (resultDetailActiveGain) resultDetailActiveGain.textContent = `${formatSigned(activeGain)} ${resultMetricLabels[activeResultMetric]}`;
    if (resultDetailCopy) resultDetailCopy.textContent = `Paired ${model.label} comparison on ${datasetLabel}; switch metrics or inspect another cell without leaving the full gallery of results.`;

    ["r1", "map"].forEach((metric) => {
      const entry = setting[metric];
      const delta = entry.iapr - entry.base;
      const deltaNode = resultDetail.querySelector(`[data-result-detail-delta="${metric}"]`);
      const baseValue = resultDetail.querySelector(`[data-result-detail-value="${metric}-base"]`);
      const iaprValue = resultDetail.querySelector(`[data-result-detail-value="${metric}-iapr"]`);
      const baseBar = resultDetail.querySelector(`[data-result-detail-bar="${metric}-base"]`);
      const iaprBar = resultDetail.querySelector(`[data-result-detail-bar="${metric}-iapr"]`);
      const metricCard = resultDetail.querySelector(`[data-result-detail-metric="${metric}"]`);

      if (deltaNode) {
        deltaNode.textContent = formatSigned(delta);
        deltaNode.classList.toggle("is-negative", delta < 0);
      }
      if (baseValue) baseValue.textContent = entry.base.toFixed(2);
      if (iaprValue) iaprValue.textContent = entry.iapr.toFixed(2);
      if (baseBar) baseBar.style.width = `${Math.max(0, Math.min(100, entry.base))}%`;
      if (iaprBar) iaprBar.style.width = `${Math.max(0, Math.min(100, entry.iapr))}%`;
      metricCard?.classList.toggle("is-primary", metric === activeResultMetric);
    });
  }

  function bindResultCells() {
    if (!resultMatrix) return;
    const cells = [...resultMatrix.querySelectorAll("[data-result-cell]")];
    cells.forEach((cell) => {
      const modelKey = cell.dataset.resultModel;
      const datasetKey = cell.dataset.resultDataset;
      const preview = () => {
        applyResultContext(modelKey, datasetKey);
        updateResultDetail(modelKey, datasetKey);
      };
      const restore = () => {
        applyResultContext(selectedResult.model, selectedResult.dataset);
        updateResultDetail(selectedResult.model, selectedResult.dataset);
      };

      cell.addEventListener("pointerenter", preview);
      cell.addEventListener("pointerleave", restore);
      cell.addEventListener("focus", preview);
      cell.addEventListener("blur", restore);
      cell.addEventListener("click", () => {
        selectedResult = { model: modelKey, dataset: datasetKey };
        applyResultContext(modelKey, datasetKey);
        updateResultDetail(modelKey, datasetKey);
      });
      cell.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
        event.preventDefault();
        const row = Number(cell.dataset.resultRowIndex);
        const col = Number(cell.dataset.resultColIndex);
        const nextRow = Math.max(0, Math.min(resultModelOrder.length - 1, row + (event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0)));
        const nextCol = Math.max(0, Math.min(resultDatasetOrder.length - 1, col + (event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0)));
        resultMatrix.querySelector(`[data-result-row-index="${nextRow}"][data-result-col-index="${nextCol}"]`)?.focus();
      });
    });
  }

  function renderResultMatrix() {
    if (!resultMatrix) return;
    const metricLabel = resultMetricLabels[activeResultMetric];
    const maxGain = maxGainForMetric(activeResultMetric) || 1;
    const parts = [
      `<div class="result-matrix-corner" role="presentation"><span>Δ over base</span><small>${metricLabel}</small></div>`,
      ...resultDatasetOrder.map((datasetKey) => `<div class="result-matrix-col" data-result-col="${datasetKey}" role="columnheader">${resultDatasets[datasetKey]}</div>`)
    ];

    resultModelOrder.forEach((modelKey, rowIndex) => {
      const model = resultData[modelKey];
      parts.push(`<div class="result-matrix-row" data-result-row="${modelKey}" role="rowheader">${model.label}</div>`);
      resultDatasetOrder.forEach((datasetKey, colIndex) => {
        const gain = resultGain(modelKey, datasetKey, activeResultMetric);
        const heat = Math.max(0, Math.min(1, gain / maxGain));
        const opacity = (.045 + heat * .16).toFixed(3);
        const borderOpacity = (.20 + heat * .36).toFixed(3);
        parts.push(`
          <button class="result-gain-cell" type="button" role="gridcell" aria-pressed="false"
            data-result-cell data-result-model="${modelKey}" data-result-dataset="${datasetKey}"
            data-result-row-index="${rowIndex}" data-result-col-index="${colIndex}"
            style="--heat-opacity:${opacity};--heat-border:${borderOpacity}"
            aria-label="${model.label} on ${resultDatasets[datasetKey]}: ${formatSigned(gain)} ${metricLabel}">
            <strong>${formatSigned(gain)}</strong><small>${metricLabel}</small>
          </button>`);
      });
    });

    resultMatrix.innerHTML = parts.join("");
    bindResultCells();
    applyResultContext(selectedResult.model, selectedResult.dataset);
  }

  function setResultMetric(metric, { focusButton = false } = {}) {
    if (!resultExplorer || !["r1", "map"].includes(metric)) return;
    activeResultMetric = metric;
    resultExplorer.dataset.metric = metric;
    resultMetricButtons.forEach((button) => {
      const active = button.dataset.resultMetric === metric;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
      if (active && focusButton) button.focus({ preventScroll: true });
    });
    renderResultMatrix();
    updateResultDetail(selectedResult.model, selectedResult.dataset);
  }

  resultMetricButtons.forEach((button, index) => {
    button.addEventListener("click", () => setResultMetric(button.dataset.resultMetric));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + resultMetricButtons.length) % resultMetricButtons.length;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % resultMetricButtons.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = resultMetricButtons.length - 1;
      setResultMetric(resultMetricButtons[nextIndex].dataset.resultMetric, { focusButton: true });
    });
  });

  if (resultExplorer) {
    setResultMetric("r1");
    // Let the first painted frame establish zero-width bars before the comparison animates in.
    if (!resultsReduceMotion) window.requestAnimationFrame(() => updateResultDetail(selectedResult.model, selectedResult.dataset));
  }

  // Count the three headline claims once when the Results section enters view.
  const resultsHeadline = document.querySelector("[data-results-headline]");
  const resultCountNodes = resultsHeadline ? [...resultsHeadline.querySelectorAll("[data-result-count]")] : [];
  let resultCountsPlayed = false;

  function finishResultCounts() {
    resultCountNodes.forEach((node) => {
      const target = Number(node.dataset.target || 0);
      node.textContent = node.dataset.resultCount === "pairs" ? `${Math.round(target)} / ${Math.round(target)}` : `+${target.toFixed(2)}`;
    });
  }

  function runResultCounts() {
    if (resultCountsPlayed || !resultCountNodes.length) return;
    resultCountsPlayed = true;
    if (resultsReduceMotion) {
      finishResultCounts();
      return;
    }

    const duration = 760;
    const started = performance.now();
    resultCountNodes.forEach((node) => {
      node.textContent = node.dataset.resultCount === "pairs" ? "0 / 15" : "+0.00";
    });

    function frame(now) {
      const raw = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - raw, 3);
      resultCountNodes.forEach((node) => {
        const target = Number(node.dataset.target || 0);
        if (node.dataset.resultCount === "pairs") {
          node.textContent = `${Math.round(target * eased)} / ${Math.round(target)}`;
        } else {
          node.textContent = `+${(target * eased).toFixed(2)}`;
        }
      });
      if (raw < 1) window.requestAnimationFrame(frame);
      else finishResultCounts();
    }
    window.requestAnimationFrame(frame);
  }

  if (resultsHeadline && "IntersectionObserver" in window && !resultsReduceMotion) {
    const resultCountObserver = new IntersectionObserver((entries, observer) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      runResultCounts();
      observer.disconnect();
    }, { threshold: .38 });
    resultCountObserver.observe(resultsHeadline);
  } else {
    runResultCounts();
  }

  // Ablation lab: only expose configurations actually reported in the RDE ablation.
  const ablationData = {
    cuhk: {
      label: "CUHK-PEDES",
      configs: {
        base: { label: "Base", r1: 71.09, map: 64.45 },
        pm: { label: "PM", r1: 70.99, map: 64.51 },
        "pm-ira": { label: "PM + IRA", r1: 71.10, map: 64.64 },
        "pm-sstt": { label: "PM + SSTT", r1: 71.22, map: 64.72 },
        full: { label: "Full IAPR", r1: 71.86, map: 65.41 }
      }
    },
    icfg: {
      label: "ICFG-PEDES",
      configs: {
        base: { label: "Base", r1: 63.66, map: 40.57 },
        pm: { label: "PM", r1: 63.68, map: 40.74 },
        "pm-ira": { label: "PM + IRA", r1: 63.76, map: 40.81 },
        "pm-sstt": { label: "PM + SSTT", r1: 63.90, map: 40.81 },
        full: { label: "Full IAPR", r1: 64.25, map: 42.02 }
      }
    },
    rstp: {
      label: "RSTPReid",
      configs: {
        base: { label: "Base", r1: 57.75, map: 46.53 },
        pm: { label: "PM", r1: 56.50, map: 44.97 },
        "pm-ira": { label: "PM + IRA", r1: 58.30, map: 45.98 },
        "pm-sstt": { label: "PM + SSTT", r1: 60.60, map: 48.04 },
        full: { label: "Full IAPR", r1: 61.10, map: 48.43 }
      }
    }
  };

  const ablationConfigMeta = {
    base: {
      components: [],
      title: "Start from the base retriever.",
      copy: "This is the RDE reference point before prototype regularization is added."
    },
    pm: {
      components: ["pm"],
      title: "Memory alone is not sufficient.",
      copy: "Persistent prototypes can help one metric while hurting another; structure around the memory matters."
    },
    "pm-ira": {
      components: ["pm", "ira"],
      title: "Identity restriction gives the memory explicit ownership.",
      copy: "Assignments are confined to prototypes owned by the ground-truth identity, changing how identity-level references are organized."
    },
    "pm-sstt": {
      components: ["pm", "sstt"],
      title: "Same-space transfer makes cross-modal supervision modality-compatible.",
      copy: "Assignment structure crosses modalities while each supervisory target remains in the feature space being regularized."
    },
    full: {
      components: ["pm", "ira", "sstt"],
      title: "The components are complementary.",
      copy: "Full IAPR combines persistence, identity ownership, and same-space cross-modal transfer; it gives the highest R@1 and mAP in the reported RDE ablation."
    }
  };

  const ablationLab = document.querySelector("[data-ablation-lab]");
  const ablationChart = ablationLab?.querySelector("[data-ablation-chart]");
  const ablationTabs = ablationLab ? [...ablationLab.querySelectorAll("[data-ablation-dataset]")] : [];
  const ablationConfigButtons = ablationLab ? [...ablationLab.querySelectorAll("[data-ablation-config]")] : [];
  const ablationComponentNodes = ablationLab ? [...ablationLab.querySelectorAll("[data-ablation-component]")] : [];
  const ablationInsight = ablationLab?.querySelector("[data-ablation-insight]");
  let activeAblationDataset = "cuhk";
  let activeAblationConfig = "pm";

  function updateAblationComponents(configKey) {
    const enabled = new Set(ablationConfigMeta[configKey]?.components || []);
    ablationComponentNodes.forEach((node) => {
      const on = enabled.has(node.dataset.ablationComponent);
      node.classList.toggle("is-on", on);
      node.setAttribute("aria-label", `${node.querySelector("b")?.textContent || "Component"}: ${on ? "enabled" : "not enabled"}`);
    });
  }

  function updateAblationInsight(configKey) {
    if (!ablationInsight) return;
    const meta = ablationConfigMeta[configKey];
    if (!meta) return;
    const title = ablationInsight.querySelector("strong");
    const copy = ablationInsight.querySelector("span");
    if (title) title.textContent = meta.title;
    if (copy) copy.textContent = meta.copy;
  }

  function ablationDeltaClass(delta) {
    if (delta > .005) return "is-positive";
    if (delta < -.005) return "is-negative";
    return "is-neutral";
  }

  function renderAblation() {
    const dataset = ablationData[activeAblationDataset];
    const base = dataset?.configs.base;
    const selected = dataset?.configs[activeAblationConfig];
    if (!dataset || !base || !selected || !ablationChart) return;

    const metrics = [
      { key: "r1", label: "R@1", base: base.r1, selected: selected.r1 },
      { key: "map", label: "mAP", base: base.map, selected: selected.map }
    ];

    ablationChart.innerHTML = `
      <header class="ablation-chart-head">
        <div><span>RDE · ${dataset.label}</span><strong>${selected.label}</strong></div>
        <small>paired against the same base</small>
      </header>
      <div class="ablation-metric-grid">
        ${metrics.map((metric) => {
          const delta = metric.selected - metric.base;
          return `
            <article class="ablation-compare-card ${ablationDeltaClass(delta)}">
              <div class="ablation-compare-head"><strong>${metric.label}</strong><span>${formatSigned(delta)}</span></div>
              <div class="ablation-compare-row"><span>Base</span><b>${metric.base.toFixed(2)}</b><i><em style="--bar:${metric.base}%"></em></i></div>
              <div class="ablation-compare-row is-selected"><span>${selected.label}</span><b>${metric.selected.toFixed(2)}</b><i><em style="--bar:${metric.selected}%"></em></i></div>
            </article>`;
        }).join("")}
      </div>`;

    updateAblationComponents(activeAblationConfig);
    updateAblationInsight(activeAblationConfig);
  }

  function setAblationDataset(datasetKey, { focusButton = false } = {}) {
    if (!ablationData[datasetKey]) return;
    activeAblationDataset = datasetKey;
    ablationTabs.forEach((button) => {
      const active = button.dataset.ablationDataset === datasetKey;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
      if (active && focusButton) button.focus({ preventScroll: true });
    });
    renderAblation();
  }

  function setAblationConfig(configKey, { focusButton = false } = {}) {
    if (!ablationConfigMeta[configKey]) return;
    activeAblationConfig = configKey;
    ablationConfigButtons.forEach((button) => {
      const active = button.dataset.ablationConfig === configKey;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
      if (active && focusButton) button.focus({ preventScroll: true });
    });
    renderAblation();
  }

  function bindLinearTabKeys(buttons, dataKey, setter) {
    buttons.forEach((button, index) => {
      button.addEventListener("click", () => setter(button.dataset[dataKey]));
      button.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + buttons.length) % buttons.length;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % buttons.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = buttons.length - 1;
        setter(buttons[nextIndex].dataset[dataKey], { focusButton: true });
      });
    });
  }

  bindLinearTabKeys(ablationTabs, "ablationDataset", setAblationDataset);
  bindLinearTabKeys(ablationConfigButtons, "ablationConfig", setAblationConfig);
  if (ablationLab) {
    setAblationDataset(activeAblationDataset);
    setAblationConfig(activeAblationConfig);
  }

  // Analysis: turn the paper diagnostics into a compact interactive story.
  const analysisReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ambiguityLab = document.querySelector("[data-ambiguity-lab]");
  const ambiguityChart = ambiguityLab?.querySelector("[data-ambiguity-chart]");
  const ambiguityDatasetTabs = ambiguityLab ? [...ambiguityLab.querySelectorAll("[data-ambiguity-dataset]")] : [];
  const ambiguityModelButtons = ambiguityLab ? [...ambiguityLab.querySelectorAll("[data-ambiguity-model]")] : [];

  const ambiguityData = {
    cuhk: {
      label: "CUHK-PEDES",
      marker: "triangle",
      clip:   [{ rho: ".01", base: 29.06, delta: .45 }, { rho: ".02", base: 29.74, delta: .61 }],
      itself: [{ rho: ".01", base: 26.01, delta: .72 }, { rho: ".02", base: 26.64, delta: .84 }],
      irra:   [{ rho: ".01", base: 32.26, delta: .27 }, { rho: ".02", base: 33.20, delta: .40 }],
      rde:    [{ rho: ".01", base: 29.45, delta: .75 }, { rho: ".02", base: 30.12, delta: .96 }],
      dm:     [{ rho: ".01", base: 32.50, delta: 1.07 }, { rho: ".02", base: 33.32, delta: 1.27 }]
    },
    icfg: {
      label: "ICFG-PEDES",
      marker: "square",
      clip:   [{ rho: ".01", base: 39.30, delta: 1.31 }, { rho: ".02", base: 40.22, delta: 1.40 }],
      itself: [{ rho: ".01", base: 33.73, delta: .79 }, { rho: ".02", base: 34.46, delta: .83 }],
      irra:   [{ rho: ".01", base: 43.07, delta: .92 }, { rho: ".02", base: 44.05, delta: 1.06 }],
      rde:    [{ rho: ".01", base: 37.12, delta: .63 }, { rho: ".02", base: 37.84, delta: .73 }],
      dm:     [{ rho: ".01", base: 42.60, delta: 1.14 }, { rho: ".02", base: 43.49, delta: 1.07 }]
    },
    rstp: {
      label: "RSTPReid",
      marker: "circle",
      clip:   [{ rho: ".01", base: 38.00, delta: .40 }, { rho: ".02", base: 38.75, delta: .45 }],
      itself: [{ rho: ".01", base: 34.35, delta: 1.75 }, { rho: ".02", base: 35.00, delta: 1.45 }],
      irra:   [{ rho: ".01", base: 41.25, delta: 1.30 }, { rho: ".02", base: 41.70, delta: .70 }],
      rde:    [{ rho: ".01", base: 42.80, delta: 3.00 }, { rho: ".02", base: 43.20, delta: 2.30 }],
      dm:     [{ rho: ".01", base: 42.35, delta: .45 }, { rho: ".02", base: 43.05, delta: .55 }]
    }
  };

  const ambiguityModels = {
    clip: { label: "CLIP", color: "#3f82b8" },
    itself: { label: "ITSELF", color: "#ee8a2d" },
    irra: { label: "IRRA", color: "#3aa657" },
    rde: { label: "RDE", color: "#df5050" },
    dm: { label: "DM-Adapter", color: "#966ac2" }
  };

  const ambiguityDatasetOrder = ["cuhk", "icfg", "rstp"];
  const ambiguityModelOrder = ["clip", "itself", "irra", "rde", "dm"];
  let activeAmbiguityDataset = "all";
  let pinnedAmbiguityModel = null;

  function ambiguityPoint(marker, x, y, color, filled, title) {
    const fill = filled ? color : "#ffffff";
    const common = `fill="${fill}" stroke="${color}" stroke-width="3" vector-effect="non-scaling-stroke"`;
    if (marker === "square") {
      return `<g><title>${title}</title><rect x="${(x - 8).toFixed(2)}" y="${(y - 8).toFixed(2)}" width="16" height="16" rx="1.5" ${common}/></g>`;
    }
    if (marker === "triangle") {
      const points = `${x.toFixed(2)},${(y - 9).toFixed(2)} ${(x - 9).toFixed(2)},${(y + 8).toFixed(2)} ${(x + 9).toFixed(2)},${(y + 8).toFixed(2)}`;
      return `<g><title>${title}</title><polygon points="${points}" ${common}/></g>`;
    }
    return `<g><title>${title}</title><circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="8" ${common}/></g>`;
  }

  function renderAmbiguityChart() {
    if (!ambiguityChart) return;
    const width = 720;
    const height = 390;
    const left = 66;
    const right = 24;
    const top = 24;
    const bottom = 62;
    const plotW = width - left - right;
    const plotH = height - top - bottom;
    const xMin = 24.5;
    const xMax = 45.0;
    const yMin = 0;
    const yMax = 3.2;
    const x = (value) => left + ((value - xMin) / (xMax - xMin)) * plotW;
    const y = (value) => top + plotH - ((value - yMin) / (yMax - yMin)) * plotH;
    const xTicks = [25, 30, 35, 40, 45];
    const yTicks = [0, .5, 1, 1.5, 2, 2.5, 3];
    const datasets = activeAmbiguityDataset === "all" ? ambiguityDatasetOrder : [activeAmbiguityDataset];

    const grid = [
      ...xTicks.map((tick) => `<line x1="${x(tick)}" y1="${top}" x2="${x(tick)}" y2="${top + plotH}" class="ambiguity-grid-line"/><text x="${x(tick)}" y="${height - 31}" text-anchor="middle" class="ambiguity-tick">${tick}</text>`),
      ...yTicks.map((tick) => `<line x1="${left}" y1="${y(tick)}" x2="${left + plotW}" y2="${y(tick)}" class="ambiguity-grid-line${tick === 0 ? " ambiguity-zero-line" : ""}"/><text x="${left - 14}" y="${y(tick) + 4}" text-anchor="end" class="ambiguity-tick">${tick.toFixed(1)}</text>`)
    ].join("");

    const series = [];
    datasets.forEach((datasetKey) => {
      const dataset = ambiguityData[datasetKey];
      ambiguityModelOrder.forEach((modelKey) => {
        const model = ambiguityModels[modelKey];
        const pair = dataset[modelKey];
        const p1 = pair[0];
        const p2 = pair[1];
        const x1 = x(p1.base); const y1 = y(p1.delta);
        const x2 = x(p2.base); const y2 = y(p2.delta);
        series.push(`
          <g class="ambiguity-series" data-ambiguity-series-model="${modelKey}" data-ambiguity-series-dataset="${datasetKey}">
            <title>${model.label} · ${dataset.label}: ΔA ${p1.delta.toFixed(2)} pp at ρ=${p1.rho}, ${p2.delta.toFixed(2)} pp at ρ=${p2.rho}</title>
            <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${model.color}" stroke-width="3" stroke-linecap="round" opacity=".72" vector-effect="non-scaling-stroke"/>
            ${ambiguityPoint(dataset.marker, x1, y1, model.color, false, `${model.label}, ${dataset.label}, ρ=${p1.rho}: base ambiguity ${p1.base.toFixed(2)}%, reduction ${p1.delta.toFixed(2)} pp`)}
            ${ambiguityPoint(dataset.marker, x2, y2, model.color, true, `${model.label}, ${dataset.label}, ρ=${p2.rho}: base ambiguity ${p2.base.toFixed(2)}%, reduction ${p2.delta.toFixed(2)} pp`)}
          </g>`);
      });
    });

    const contextLabel = activeAmbiguityDataset === "all" ? "all three benchmarks" : ambiguityData[activeAmbiguityDataset].label;
    ambiguityChart.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="ambiguitySvgTitle ambiguitySvgDesc">
        <title id="ambiguitySvgTitle">Identity-level ambiguity reduction for ${contextLabel}</title>
        <desc id="ambiguitySvgDesc">The horizontal axis is base ambiguity rate and the vertical axis is percentage-point ambiguity reduction after IAPR. Each connected pair shows thresholds rho .01 and .02. All displayed reductions are positive.</desc>
        ${grid}
        <line x1="${left}" y1="${top}" x2="${left}" y2="${top + plotH}" class="ambiguity-axis-line"/>
        <line x1="${left}" y1="${top + plotH}" x2="${left + plotW}" y2="${top + plotH}" class="ambiguity-axis-line"/>
        ${series.join("")}
        <text x="${left + plotW / 2}" y="${height - 5}" text-anchor="middle" class="ambiguity-axis-label">Base ambiguity ABase(ρ) (%)</text>
        <text x="18" y="${top + plotH / 2}" text-anchor="middle" class="ambiguity-axis-label" transform="rotate(-90 18 ${top + plotH / 2})">Ambiguity reduction ΔA(ρ) (pp)</text>
      </svg>`;
    applyAmbiguityModelFocus(pinnedAmbiguityModel);
  }

  function applyAmbiguityModelFocus(modelKey) {
    if (!ambiguityChart) return;
    ambiguityChart.querySelectorAll("[data-ambiguity-series-model]").forEach((series) => {
      series.classList.toggle("is-dimmed", !!modelKey && series.dataset.ambiguitySeriesModel !== modelKey);
      series.classList.toggle("is-focused", !!modelKey && series.dataset.ambiguitySeriesModel === modelKey);
    });
  }

  function setAmbiguityDataset(datasetKey, { focusButton = false } = {}) {
    if (!["all", ...ambiguityDatasetOrder].includes(datasetKey)) return;
    activeAmbiguityDataset = datasetKey;
    ambiguityDatasetTabs.forEach((button) => {
      const active = button.dataset.ambiguityDataset === datasetKey;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
      if (active && focusButton) button.focus({ preventScroll: true });
    });
    if (!analysisReduceMotion) {
      ambiguityChart?.classList.add("is-switching");
      window.setTimeout(() => ambiguityChart?.classList.remove("is-switching"), 240);
    }
    renderAmbiguityChart();
  }

  ambiguityDatasetTabs.forEach((button, index) => {
    button.addEventListener("click", () => setAmbiguityDataset(button.dataset.ambiguityDataset));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + ambiguityDatasetTabs.length) % ambiguityDatasetTabs.length;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % ambiguityDatasetTabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = ambiguityDatasetTabs.length - 1;
      setAmbiguityDataset(ambiguityDatasetTabs[nextIndex].dataset.ambiguityDataset, { focusButton: true });
    });
  });

  ambiguityModelButtons.forEach((button, index) => {
    const modelKey = button.dataset.ambiguityModel;
    const model = ambiguityModels[modelKey];
    if (model) button.style.setProperty("--model-color", model.color);
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("pointerenter", () => applyAmbiguityModelFocus(modelKey));
    button.addEventListener("pointerleave", () => applyAmbiguityModelFocus(pinnedAmbiguityModel));
    button.addEventListener("focus", () => applyAmbiguityModelFocus(modelKey));
    button.addEventListener("blur", () => applyAmbiguityModelFocus(pinnedAmbiguityModel));
    button.addEventListener("click", () => {
      pinnedAmbiguityModel = pinnedAmbiguityModel === modelKey ? null : modelKey;
      ambiguityModelButtons.forEach((item) => item.setAttribute("aria-pressed", String(item.dataset.ambiguityModel === pinnedAmbiguityModel)));
      applyAmbiguityModelFocus(pinnedAmbiguityModel);
    });
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      ambiguityModelButtons[(index + delta + ambiguityModelButtons.length) % ambiguityModelButtons.length].focus();
    });
  });

  if (ambiguityChart) renderAmbiguityChart();

  const shiftData = {
    cuhk: {
      label: "CUHK-PEDES", total: 61.8,
      ideal: { good: 21.9, bad: 10.2 },
      negative: { good: 34.4, bad: 4.0 },
      positive: { good: 5.5, bad: 24.0 },
      title: "Hard-negative suppression leads on CUHK-PEDES.",
      copy: "Negative suppressed more is the largest favorable pattern at 34.4%, while its hard-negative-amplifying reverse remains only 4.0%."
    },
    icfg: {
      label: "ICFG-PEDES", total: 60.9,
      ideal: { good: 17.6, bad: 7.6 },
      negative: { good: 41.0, bad: 1.5 },
      positive: { good: 2.3, bad: 30.0 },
      title: "Hard-negative suppression is strongest on ICFG-PEDES.",
      copy: "Negative suppressed more reaches 41.0%, while the reverse hard-negative amplification pattern remains rare at 1.5%."
    },
    rstp: {
      label: "RSTPReid", total: 64.9,
      ideal: { good: 29.5, bad: 12.0 },
      negative: { good: 23.3, bad: 7.0 },
      positive: { good: 12.0, bad: 16.1 },
      title: "RSTPReid shifts toward direct two-sided separation.",
      copy: "Positive ↑, Negative ↓ becomes the largest favorable pattern at 29.5%, with a larger contribution from positive amplification than on the other datasets."
    }
  };

  const shiftLab = document.querySelector("[data-shift-lab]");
  const shiftTabs = shiftLab ? [...shiftLab.querySelectorAll("[data-shift-dataset]")] : [];
  const shiftCards = shiftLab ? [...shiftLab.querySelectorAll("[data-shift-family]")] : [];
  const shiftTotal = shiftLab?.querySelector("[data-shift-total]");
  const shiftTitle = shiftLab?.querySelector("[data-shift-title]");
  const shiftCopy = shiftLab?.querySelector("[data-shift-copy]");
  let activeShiftDataset = "cuhk";

  function setShiftDataset(datasetKey, { focusButton = false } = {}) {
    const data = shiftData[datasetKey];
    if (!data || !shiftLab) return;
    activeShiftDataset = datasetKey;
    shiftLab.dataset.shiftDataset = datasetKey;

    shiftTabs.forEach((button) => {
      const active = button.dataset.shiftDataset === datasetKey;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
      if (active && focusButton) button.focus({ preventScroll: true });
    });

    if (shiftTotal) shiftTotal.textContent = `${data.total.toFixed(1)}%`;
    if (shiftTitle) shiftTitle.textContent = data.title;
    if (shiftCopy) shiftCopy.textContent = data.copy;

    const dominantFamily = ["ideal", "negative", "positive"].sort((a, b) => data[b].good - data[a].good)[0];
    const scaleMax = 55;
    shiftCards.forEach((card) => {
      const family = card.dataset.shiftFamily;
      const familyData = data[family];
      if (!familyData) return;
      card.classList.toggle("is-dominant", family === dominantFamily);
      ["good", "bad"].forEach((kind) => {
        const bar = card.querySelector(`[data-shift-bar="${kind}"]`);
        const value = card.querySelector(`[data-shift-value="${kind}"]`);
        if (bar) bar.style.setProperty("--shift-bar", `${Math.min(100, (familyData[kind] / scaleMax) * 100).toFixed(2)}%`);
        if (value) value.textContent = `${familyData[kind].toFixed(1)}%`;
      });
    });

    if (!analysisReduceMotion) {
      shiftLab.classList.remove("is-updating");
      void shiftLab.offsetWidth;
      shiftLab.classList.add("is-updating");
      window.setTimeout(() => shiftLab?.classList.remove("is-updating"), 420);
    }
  }

  shiftTabs.forEach((button, index) => {
    button.addEventListener("click", () => setShiftDataset(button.dataset.shiftDataset));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + shiftTabs.length) % shiftTabs.length;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % shiftTabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = shiftTabs.length - 1;
      setShiftDataset(shiftTabs[nextIndex].dataset.shiftDataset, { focusButton: true });
    });
  });

  if (shiftLab) setShiftDataset(activeShiftDataset);


  const qualitativeSourceFiles = {
    clip: {
      cuhk: "assets/qualitative/[re]clip-cuhk.png",
      icfg: "assets/qualitative/[re]clip-icfg.png",
      rstp: "assets/qualitative/[re]clip-rstp.png"
    },
    itself: {
      cuhk: "assets/qualitative/[re]itself-cuhk.png",
      icfg: "assets/qualitative/[re]itself-icfg.png",
      rstp: "assets/qualitative/[re]itself-rstp.png"
    },
    irra: {
      cuhk: "assets/qualitative/[re]irra-cuhk.png",
      icfg: "assets/qualitative/[re]irra-icfg.png",
      rstp: "assets/qualitative/[re]irra-rstp.png"
    },
    rde: {
      cuhk: "assets/qualitative/[re]rde-cuhk.png",
      icfg: "assets/qualitative/[re]rde-icfg.png",
      rstp: "assets/qualitative/[re]rde-rstp.png"
    },
    "dm-adapter": {
      cuhk: "assets/qualitative/[re]dm-adapter-cuhk.png",
      icfg: "assets/qualitative/[re]dm-adapter-icfg.png",
      rstp: "assets/qualitative/[re]dm-adapter-rstp.png"
    }
  };

  const qualitativeLabels = {
    retriever: {
      clip: "CLIP",
      itself: "ITSELF",
      irra: "IRRA",
      rde: "RDE",
      "dm-adapter": "DM-Adapter"
    },
    dataset: {
      cuhk: "CUHK-PEDES",
      icfg: "ICFG-PEDES",
      rstp: "RSTPReid"
    }
  };

  // Per-figure crop calibration for the 15 qualitative composites.
  // Coordinates are measured on the source figures and kept in reference pixels;
  // applyQualitativeCrop converts them to normalized CSS offsets at runtime.
  const qualitativeCropLayouts = {
    clip: {
      cuhk: {
        width: 4023, height: 1798,
        overviewRows: [{ y: 75, height: 536 }, { y: 661, height: 538 }, { y: 1215, height: 538 }],
        cropRows: {
          query: [{ y: 159, height: 441 }, { y: 745, height: 443 }, { y: 1299, height: 443 }],
          ranking: [{ y: 85, height: 519 }, { y: 671, height: 521 }, { y: 1225, height: 521 }]
        },
        regions: { query: { x: 0, width: 690 }, iapr: { x: 793, width: 1574 }, base: { x: 2471, width: 1552 } }
      },
      icfg: {
        width: 4023, height: 1809,
        overviewRows: [{ y: 77, height: 538 }, { y: 665, height: 539 }, { y: 1221, height: 537 }],
        cropRows: {
          query: [{ y: 161, height: 443 }, { y: 749, height: 444 }, { y: 1305, height: 442 }],
          ranking: [{ y: 87, height: 521 }, { y: 675, height: 522 }, { y: 1231, height: 520 }]
        },
        regions: { query: { x: 0, width: 690 }, iapr: { x: 780, width: 1574 }, base: { x: 2461, width: 1562 } }
      },
      rstp: {
        width: 4023, height: 1810,
        overviewRows: [{ y: 76, height: 538 }, { y: 663, height: 541 }, { y: 1217, height: 541 }],
        cropRows: {
          query: [{ y: 160, height: 443 }, { y: 747, height: 446 }, { y: 1301, height: 446 }],
          ranking: [{ y: 86, height: 521 }, { y: 673, height: 524 }, { y: 1227, height: 524 }]
        },
        regions: { query: { x: 0, width: 690 }, iapr: { x: 783, width: 1573 }, base: { x: 2461, width: 1562 } }
      }
    },
    itself: {
      cuhk: {
        width: 4023, height: 1806,
        overviewRows: [{ y: 73, height: 539 }, { y: 660, height: 539 }, { y: 1217, height: 540 }],
        cropRows: {
          query: [{ y: 157, height: 444 }, { y: 744, height: 444 }, { y: 1301, height: 445 }],
          ranking: [{ y: 83, height: 522 }, { y: 670, height: 522 }, { y: 1227, height: 523 }]
        },
        regions: { query: { x: 0, width: 690 }, iapr: { x: 784, width: 1575 }, base: { x: 2466, width: 1557 } }
      },
      icfg: {
        width: 4023, height: 1814,
        overviewRows: [{ y: 67, height: 539 }, { y: 655, height: 542 }, { y: 1213, height: 541 }],
        cropRows: {
          query: [{ y: 151, height: 444 }, { y: 739, height: 447 }, { y: 1297, height: 446 }],
          ranking: [{ y: 77, height: 522 }, { y: 665, height: 525 }, { y: 1223, height: 524 }]
        },
        regions: { query: { x: 0, width: 690 }, iapr: { x: 783, width: 1577 }, base: { x: 2467, width: 1556 } }
      },
      rstp: {
        width: 4023, height: 1799,
        overviewRows: [{ y: 60, height: 537 }, { y: 648, height: 539 }, { y: 1202, height: 538 }],
        cropRows: {
          query: [{ y: 144, height: 442 }, { y: 732, height: 444 }, { y: 1286, height: 443 }],
          ranking: [{ y: 70, height: 520 }, { y: 658, height: 522 }, { y: 1212, height: 521 }]
        },
        regions: { query: { x: 0, width: 690 }, iapr: { x: 785, width: 1575 }, base: { x: 2464, width: 1559 } }
      }
    },
    irra: {
      cuhk: {
        // IRRA · CUHK-PEDES has been rescaled to match the standard
        // qualitative-figure geometry used by the other retriever/dataset pairs.
        width: 4023, height: 1805,
        overviewRows: [{ y: 75, height: 539 }, { y: 662, height: 539 }, { y: 1218, height: 539 }],
        cropRows: {
          query: [{ y: 159, height: 444 }, { y: 746, height: 444 }, { y: 1302, height: 444 }],
          ranking: [{ y: 85, height: 522 }, { y: 672, height: 522 }, { y: 1228, height: 522 }]
        },
        regions: { query: { x: 0, width: 690 }, iapr: { x: 784, width: 1575 }, base: { x: 2466, width: 1557 } }
      },
      icfg: {
        width: 4023, height: 1844,
        overviewRows: [{ y: 82, height: 541 }, { y: 672, height: 544 }, { y: 1229, height: 540 }],
        cropRows: {
          query: [{ y: 166, height: 446 }, { y: 756, height: 449 }, { y: 1313, height: 445 }],
          ranking: [{ y: 92, height: 524 }, { y: 682, height: 527 }, { y: 1239, height: 523 }]
        },
        regions: { query: { x: 0, width: 690 }, iapr: { x: 783, width: 1578 }, base: { x: 2467, width: 1556 } }
      },
      rstp: {
        width: 4023, height: 1820,
        overviewRows: [{ y: 81, height: 541 }, { y: 667, height: 540 }, { y: 1223, height: 537 }],
        cropRows: {
          query: [{ y: 165, height: 446 }, { y: 751, height: 445 }, { y: 1307, height: 442 }],
          ranking: [{ y: 91, height: 524 }, { y: 677, height: 523 }, { y: 1233, height: 520 }]
        },
        regions: { query: { x: 0, width: 690 }, iapr: { x: 783, width: 1574 }, base: { x: 2462, width: 1561 } }
      }
    },
    rde: {
      cuhk: {
        width: 4023, height: 1809,
        overviewRows: [{ y: 75, height: 540 }, { y: 664, height: 539 }, { y: 1219, height: 540 }],
        cropRows: {
          query: [{ y: 159, height: 445 }, { y: 748, height: 444 }, { y: 1303, height: 445 }],
          ranking: [{ y: 85, height: 523 }, { y: 674, height: 522 }, { y: 1229, height: 523 }]
        },
        regions: { query: { x: 0, width: 690 }, iapr: { x: 780, width: 1576 }, base: { x: 2461, width: 1562 } }
      },
      icfg: {
        width: 4023, height: 1815,
        overviewRows: [{ y: 83, height: 540 }, { y: 673, height: 542 }, { y: 1227, height: 544 }],
        cropRows: {
          query: [{ y: 167, height: 445 }, { y: 757, height: 447 }, { y: 1311, height: 449 }],
          ranking: [{ y: 93, height: 523 }, { y: 683, height: 525 }, { y: 1237, height: 527 }]
        },
        regions: { query: { x: 0, width: 690 }, iapr: { x: 784, width: 1577 }, base: { x: 2467, width: 1556 } }
      },
      rstp: {
        width: 4023, height: 1815,
        overviewRows: [{ y: 77, height: 538 }, { y: 665, height: 542 }, { y: 1222, height: 540 }],
        cropRows: {
          query: [{ y: 161, height: 443 }, { y: 749, height: 447 }, { y: 1306, height: 445 }],
          ranking: [{ y: 87, height: 521 }, { y: 675, height: 525 }, { y: 1232, height: 523 }]
        },
        regions: { query: { x: 0, width: 690 }, iapr: { x: 785, width: 1581 }, base: { x: 2467, width: 1556 } }
      }
    },
    "dm-adapter": {
      cuhk: {
        width: 4023, height: 1803,
        overviewRows: [{ y: 76, height: 538 }, { y: 663, height: 538 }, { y: 1217, height: 539 }],
        cropRows: {
          query: [{ y: 160, height: 443 }, { y: 747, height: 443 }, { y: 1301, height: 444 }],
          ranking: [{ y: 86, height: 521 }, { y: 673, height: 521 }, { y: 1227, height: 522 }]
        },
        regions: { query: { x: 0, width: 690 }, iapr: { x: 789, width: 1572 }, base: { x: 2468, width: 1555 } }
      },
      icfg: {
        width: 4023, height: 1831,
        overviewRows: [{ y: 82, height: 538 }, { y: 669, height: 542 }, { y: 1226, height: 539 }],
        cropRows: {
          query: [{ y: 166, height: 443 }, { y: 753, height: 447 }, { y: 1310, height: 444 }],
          ranking: [{ y: 92, height: 521 }, { y: 679, height: 525 }, { y: 1236, height: 522 }]
        },
        regions: { query: { x: 0, width: 690 }, iapr: { x: 784, width: 1575 }, base: { x: 2465, width: 1558 } }
      },
      rstp: {
        width: 4022, height: 1802,
        overviewRows: [{ y: 56, height: 539 }, { y: 644, height: 540 }, { y: 1203, height: 539 }],
        cropRows: {
          query: [{ y: 140, height: 444 }, { y: 728, height: 445 }, { y: 1287, height: 444 }],
          ranking: [{ y: 66, height: 522 }, { y: 654, height: 523 }, { y: 1213, height: 522 }]
        },
        regions: { query: { x: 0, width: 690 }, iapr: { x: 781, width: 1576 }, base: { x: 2465, width: 1557 } }
      }
    }
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const qualExplorer = document.querySelector("[data-qual-explorer]");
  const qualStage = qualExplorer?.querySelector("[data-qual-stage]");
  const qualOverviewImage = qualExplorer?.querySelector("[data-qual-overview-image]");
  const qualRowFocus = qualExplorer?.querySelector("[data-qual-row-focus]");
  const qualStageKicker = qualExplorer?.querySelector("[data-qual-stage-kicker]");
  const qualBaseLabel = qualExplorer?.querySelector("[data-qual-base-label]");
  const qualIaprLabel = qualExplorer?.querySelector("[data-qual-iapr-label]");
  const qualStatus = qualExplorer?.querySelector("[data-qual-status]");
  const qualRetrieverTabs = qualExplorer ? [...qualExplorer.querySelectorAll("[data-qual-retriever]")] : [];
  const qualDatasetTabs = qualExplorer ? [...qualExplorer.querySelectorAll("[data-qual-dataset]")] : [];
  const qualCaseTabs = qualExplorer ? [...qualExplorer.querySelectorAll("[data-qual-case]")] : [];
  const qualCropElements = qualExplorer ? [...qualExplorer.querySelectorAll("[data-qual-crop]")] : [];
  const qualOriginalButtons = qualExplorer ? [...qualExplorer.querySelectorAll("[data-qual-open-original]")] : [];

  let activeRetriever = "clip";
  let activeDataset = "cuhk";
  let activeCase = 0;
  let qualitativeFigure = qualitativeSourceFiles[activeRetriever][activeDataset];
  let qualSwitchTimer = 0;
  let qualMotionTimer = 0;
  let qualHasEnteredViewport = false;

  function setSelected(tabs, selected) {
    tabs.forEach((tab) => {
      const isSelected = tab === selected;
      tab.setAttribute("aria-selected", String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
    });
  }

  function getQualitativeCropLayout(retriever = activeRetriever, dataset = activeDataset) {
    return qualitativeCropLayouts[retriever]?.[dataset]
      || qualitativeCropLayouts.clip.cuhk;
  }

  function getQualitativeCropRow(layout, regionName, caseIndex) {
    const rowGroup = regionName === "query" ? "query" : "ranking";
    return layout.cropRows?.[rowGroup]?.[caseIndex] || null;
  }

  function applyQualitativeCrop(cropElement, image, regionName, caseIndex) {
    const layout = getQualitativeCropLayout();
    const region = layout.regions?.[regionName];
    const row = getQualitativeCropRow(layout, regionName, caseIndex);
    if (!region || !row || !layout.width || !layout.height || !image.naturalWidth || !image.naturalHeight) return;

    const regionWidth = region.width / layout.width;
    const regionX = region.x / layout.width;
    const rowY = row.y / layout.height;
    const rowHeight = row.height / layout.height;

    cropElement.style.setProperty("--qual-crop-image-width", `${(100 / regionWidth).toFixed(4)}%`);
    cropElement.style.setProperty("--qual-crop-x", `${(-regionX * 100).toFixed(4)}%`);
    cropElement.style.setProperty("--qual-crop-y", `${(-rowY * 100).toFixed(4)}%`);

    const cropRatio = (regionWidth * image.naturalWidth) / (rowHeight * image.naturalHeight);
    cropElement.style.aspectRatio = String(cropRatio);

    // Useful when fine-tuning a single figure in DevTools.
    cropElement.dataset.qualCropLayout = `${activeRetriever}:${activeDataset}:${caseIndex + 1}:${regionName}`;
  }

  function updateQualitativeCropImages(src) {
    qualCropElements.forEach((crop) => {
      const image = crop.querySelector("[data-qual-crop-image]");
      const regionName = crop.dataset.qualCrop;
      if (!image || !regionName) return;
      image.onload = () => applyQualitativeCrop(crop, image, regionName, activeCase);
      image.src = src;
      if (image.complete) applyQualitativeCrop(crop, image, regionName, activeCase);
    });
  }

  function playQualitativeComparison() {
    if (!qualStage || reduceMotion) return;
    window.clearTimeout(qualMotionTimer);
    qualStage.classList.remove("is-playing");
    void qualStage.offsetWidth;
    qualStage.classList.add("is-playing");
    qualMotionTimer = window.setTimeout(() => qualStage.classList.remove("is-playing"), 2400);
  }

  function commitQualitativeUpdate(play = false) {
    if (!qualStage || !qualOverviewImage || !qualRowFocus || !qualStageKicker || !qualBaseLabel || !qualIaprLabel) return;
    qualitativeFigure = qualitativeSourceFiles[activeRetriever]?.[activeDataset];
    if (!qualitativeFigure) return;

    const retrieverLabel = qualitativeLabels.retriever[activeRetriever];
    const datasetLabel = qualitativeLabels.dataset[activeDataset];
    const alt = `${retrieverLabel} qualitative retrieval comparison on ${datasetLabel}`;

    qualOverviewImage.src = qualitativeFigure;
    qualOverviewImage.alt = alt;
    qualStageKicker.textContent = `${retrieverLabel} · ${datasetLabel}`;
    qualBaseLabel.textContent = retrieverLabel;
    qualIaprLabel.textContent = `${retrieverLabel}–IAPR`;
    updateQualitativeCropImages(qualitativeFigure);

    const layout = getQualitativeCropLayout();
    const row = layout.overviewRows?.[activeCase];
    if (row) {
      qualRowFocus.style.setProperty("--qual-row-top", `${(row.y / layout.height * 100).toFixed(3)}%`);
      qualRowFocus.style.setProperty("--qual-row-height", `${(row.height / layout.height * 100).toFixed(3)}%`);
    }
    const focusLabel = qualRowFocus.querySelector("b");
    if (focusLabel) focusLabel.textContent = `CASE ${String(activeCase + 1).padStart(2, "0")}`;

    if (qualStatus) {
      qualStatus.textContent = `${retrieverLabel}, ${datasetLabel}, case ${activeCase + 1} selected.`;
    }

    if (play && qualHasEnteredViewport) {
      window.setTimeout(playQualitativeComparison, reduceMotion ? 0 : 100);
    }
  }

  function updateQualitativeViewer(play = false) {
    if (!qualStage) return;
    window.clearTimeout(qualSwitchTimer);
    if (reduceMotion) {
      commitQualitativeUpdate(play);
      return;
    }
    qualStage.classList.add("is-switching");
    qualSwitchTimer = window.setTimeout(() => {
      commitQualitativeUpdate(play);
      window.requestAnimationFrame(() => qualStage.classList.remove("is-switching"));
    }, 110);
  }

  qualRetrieverTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      activeRetriever = tab.dataset.qualRetriever;
      setSelected(qualRetrieverTabs, tab);
      updateQualitativeViewer(true);
    });
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const next = qualRetrieverTabs[(index + delta + qualRetrieverTabs.length) % qualRetrieverTabs.length];
      next.focus();
      activeRetriever = next.dataset.qualRetriever;
      setSelected(qualRetrieverTabs, next);
      updateQualitativeViewer(true);
    });
  });

  qualDatasetTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      activeDataset = tab.dataset.qualDataset;
      setSelected(qualDatasetTabs, tab);
      updateQualitativeViewer(true);
    });
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const next = qualDatasetTabs[(index + delta + qualDatasetTabs.length) % qualDatasetTabs.length];
      next.focus();
      activeDataset = next.dataset.qualDataset;
      setSelected(qualDatasetTabs, next);
      updateQualitativeViewer(true);
    });
  });

  qualCaseTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      activeCase = Number.parseInt(tab.dataset.qualCase, 10) || 0;
      setSelected(qualCaseTabs, tab);
      updateQualitativeViewer(true);
    });
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const next = qualCaseTabs[(index + delta + qualCaseTabs.length) % qualCaseTabs.length];
      next.focus();
      activeCase = Number.parseInt(next.dataset.qualCase, 10) || 0;
      setSelected(qualCaseTabs, next);
      updateQualitativeViewer(true);
    });
  });

  if (qualRetrieverTabs.length) setSelected(qualRetrieverTabs, qualRetrieverTabs[0]);
  if (qualDatasetTabs.length) setSelected(qualDatasetTabs, qualDatasetTabs[0]);
  if (qualCaseTabs.length) setSelected(qualCaseTabs, qualCaseTabs[0]);

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const closeLightboxButtons = [...document.querySelectorAll("[data-close-lightbox]")];
  let lastFocusedElement = null;

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImage || !src) return;
    lastFocusedElement = document.activeElement;
    lightboxImage.src = src;
    lightboxImage.alt = alt || "Full-resolution figure";
    lightbox.hidden = false;
    document.body.classList.add("lightbox-open");
    const closeButton = lightbox.querySelector(".lightbox-close");
    requestAnimationFrame(() => closeButton?.focus());
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImage || lightbox.hidden) return;
    lightbox.hidden = true;
    lightboxImage.src = "";
    lightboxImage.alt = "";
    document.body.classList.remove("lightbox-open");
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") lastFocusedElement.focus();
  }

  function openCurrentQualitative() {
    const retrieverLabel = qualitativeLabels.retriever[activeRetriever];
    const datasetLabel = qualitativeLabels.dataset[activeDataset];
    openLightbox(qualitativeFigure, `${retrieverLabel} qualitative retrieval comparison on ${datasetLabel}`);
  }

  qualOriginalButtons.forEach((button) => button.addEventListener("click", openCurrentQualitative));

  document.querySelectorAll(".figure-button[data-lightbox-src]").forEach((button) => {
    button.addEventListener("click", () => {
      openLightbox(button.dataset.lightboxSrc, button.dataset.lightboxAlt || "Analysis figure");
    });
  });

  closeLightboxButtons.forEach((button) => button.addEventListener("click", closeLightbox));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox && !lightbox.hidden) closeLightbox();
  });

  commitQualitativeUpdate(false);
  if (qualStage) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      qualHasEnteredViewport = true;
    } else {
      const qualObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || qualHasEnteredViewport) return;
          qualHasEnteredViewport = true;
          playQualitativeComparison();
          qualObserver.disconnect();
        });
      }, { threshold: 0.32, rootMargin: "0px 0px -8% 0px" });
      qualObserver.observe(qualStage);
    }
  }

  function bindActiveNavigation() {
    const nav = document.querySelector(".site-nav");
    const navLinksContainer = document.getElementById("primaryNav");
    const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
    const targets = navLinks
      .map((link) => ({ link, section: document.querySelector(link.getAttribute("href")) }))
      .filter((item) => item.section);

    if (!targets.length) return;

    let activeItem = null;
    let frame = 0;

    function keepActiveLinkVisible(link) {
      if (!navLinksContainer || navLinksContainer.scrollWidth <= navLinksContainer.clientWidth) return;
      const targetLeft = link.offsetLeft - (navLinksContainer.clientWidth - link.offsetWidth) / 2;
      navLinksContainer.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: reduceMotion ? "auto" : "smooth"
      });
    }

    function setActive(item, ensureVisible = false) {
      if (!item || item === activeItem) {
        if (ensureVisible && item) keepActiveLinkVisible(item.link);
        return;
      }

      activeItem = item;
      targets.forEach(({ link }) => {
        const isActive = link === item.link;
        link.classList.toggle("active", isActive);
        if (isActive) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });

      if (ensureVisible) keepActiveLinkVisible(item.link);
    }

    function updateActiveNavigation() {
      frame = 0;
      const navHeight = nav?.getBoundingClientRect().height || 0;
      const anchor = window.scrollY + navHeight + 30;
      let nextActive = targets[0];

      targets.forEach((item) => {
        if (item.section.offsetTop <= anchor) nextActive = item;
      });

      const atDocumentEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 3;
      if (atDocumentEnd) nextActive = targets[targets.length - 1];

      setActive(nextActive, true);
    }

    function scheduleUpdate() {
      if (frame) return;
      frame = window.requestAnimationFrame(updateActiveNavigation);
    }

    targets.forEach((item) => {
      item.link.addEventListener("click", () => setActive(item, true));
    });

    updateActiveNavigation();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);
    if (document.fonts?.ready) document.fonts.ready.then(scheduleUpdate).catch(() => {});
  }

  bindActiveNavigation();

  const revealNodes = [...document.querySelectorAll(".reveal")];
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealNodes.forEach((node) => observer.observe(node));
  }

})();
