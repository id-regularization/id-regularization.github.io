(() => {
  const hardNegatives = {
    target: {
      kicker: "True target",
      title: "All query-grounding details match.",
      body: "Shoulder-length straight dark hair, zipped hooded jacket with subtle side pockets, plain white low-top sneakers, a small black backpack with thin straps, and a beige tote held in the left hand.",
      diff: '<span class="diff-good">✓ Identity-consistent reference</span>'
    },
    hn1: {
      kicker: "Hard negative 1 · backpack mismatch",
      title: "The overall appearance matches — the backpack does not.",
      body: "This distractor keeps the dark green jacket, black pants, white shoes, black backpack, and beige tote, but the backpack is medium-sized with thick padded straps and a visible front pocket.",
      diff: '<span class="diff-key">Query:</span> small plain backpack · thin straps <span class="diff-arrow">→</span> <span class="diff-bad">HN:</span> medium backpack · thick straps · front pocket'
    },
    hn2: {
      kicker: "Hard negative 2 · jacket mismatch",
      title: "One construction detail changes the jacket identity cue.",
      body: "The distractor is still dressed almost identically, but the jacket is a hooded pullover with no front zipper and a large kangaroo pocket instead of the target’s zipped jacket with subtle side pockets.",
      diff: '<span class="diff-key">Query:</span> front zipper · side pockets <span class="diff-arrow">→</span> <span class="diff-bad">HN:</span> pullover · kangaroo pocket'
    },
    hn3: {
      kicker: "Hard negative 3 · shoes mismatch",
      title: "The color is right, but the shoe construction is wrong.",
      body: "Both people wear white sneakers. The hard negative switches the target’s plain white low-top sneakers for white high-top sneakers with a dark sole.",
      diff: '<span class="diff-key">Query:</span> plain white low-tops <span class="diff-arrow">→</span> <span class="diff-bad">HN:</span> high-tops · dark sole'
    },
    hn4: {
      kicker: "Hard negative 4 · hair + tote-side mismatch",
      title: "Two small relational cues break the match.",
      body: "The distractor changes the shoulder-length straight hair into a loose low ponytail and carries the beige tote in the right hand instead of the left.",
      diff: '<span class="diff-key">Query:</span> shoulder-length hair · tote left <span class="diff-arrow">→</span> <span class="diff-bad">HN:</span> low ponytail · tote right'
    }
  };

  const hnCards = [...document.querySelectorAll(".hn-card")];
  const hnDetailKicker = document.getElementById("hnDetailKicker");
  const hnDetailTitle = document.getElementById("hnDetailTitle");
  const hnDetailBody = document.getElementById("hnDetailBody");
  const hnDiff = document.getElementById("hnDiff");

  function setHardNegative(key) {
    const data = hardNegatives[key];
    if (!data || !hnDetailKicker || !hnDetailTitle || !hnDetailBody || !hnDiff) return;
    hnCards.forEach((card) => {
      const selected = card.dataset.hn === key;
      card.classList.toggle("is-selected", selected);
      card.setAttribute("aria-pressed", String(selected));
    });
    hnDetailKicker.textContent = data.kicker;
    hnDetailTitle.textContent = data.title;
    hnDetailBody.textContent = data.body;
    hnDiff.innerHTML = data.diff;
  }

  hnCards.forEach((card, index) => {
    card.addEventListener("click", () => setHardNegative(card.dataset.hn));
    card.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (index + delta + hnCards.length) % hnCards.length;
      hnCards[nextIndex].focus();
      setHardNegative(hnCards[nextIndex].dataset.hn);
    });
  });

  const methodStages = {
    remember: {
      title: "Persistent identity prototypes",
      body: "IAPR keeps multiple visual and textual prototype slots for every training identity, so identity-level references survive beyond the current mini-batch.",
      takeaway: "Remember the identity across mini-batches."
    },
    assign: {
      title: "Only assign inside the correct identity",
      body: "Identity-Restricted Assignment limits each observation to prototype slots owned by its ground-truth identity. Visually similar people cannot absorb that update.",
      takeaway: "Restrict assignment by identity, not global similarity."
    },
    translate: {
      title: "Share structure without forcing mismatched spaces",
      body: "Same-Space Translated Targets transfer which observations belong together across modalities while constructing the target inside the feature space being supervised.",
      takeaway: "Transfer the grouping structure — not an opposite-modality prototype vector."
    },
    separate: {
      title: "Focus on the identity-wrong competitor",
      body: "The prototype objective contrasts same-identity targets with the most similar identity-wrong references, concentrating supervision on the local competition that produces top-ranked errors.",
      takeaway: "Increase separation where the hard negative actually competes."
    }
  };

  const methodCanvas = document.getElementById("methodCanvas");
  const stageTitle = document.getElementById("stageTitle");
  const stageBody = document.getElementById("stageBody");
  const stageTakeaway = document.getElementById("stageTakeaway");
  const methodButtons = [...document.querySelectorAll(".method-step")];

  function setMethodStage(stage) {
    const data = methodStages[stage];
    if (!data || !methodCanvas || !stageTitle || !stageBody || !stageTakeaway) return;
    methodCanvas.dataset.stage = stage;
    stageTitle.textContent = data.title;
    stageBody.textContent = data.body;
    stageTakeaway.textContent = data.takeaway;
    methodButtons.forEach((button) => {
      button.setAttribute("aria-selected", String(button.dataset.stage === stage));
      button.tabIndex = button.dataset.stage === stage ? 0 : -1;
    });
  }

  methodButtons.forEach((button, index) => {
    button.addEventListener("click", () => setMethodStage(button.dataset.stage));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const nextIndex = event.key === "ArrowRight"
        ? (index + 1) % methodButtons.length
        : (index - 1 + methodButtons.length) % methodButtons.length;
      methodButtons[nextIndex].focus();
      setMethodStage(methodButtons[nextIndex].dataset.stage);
    });
  });

  if (methodCanvas && methodButtons.length) setMethodStage(methodCanvas.dataset.stage || "remember");

  const qualitativeSourceFiles = {
    clip: {
      cuhk: "assets/qualitative/[re]clip-cuhk.png",
      icfg: "assets/qualitative/[re]clip-icfg.png",
      rstp: "assets/qualitative/[re]clip-rstp.png"
    },
    itself: {
      cuhk: "assets/qualitative/[re]itself-cuhk.png",
      icfg: "assets/qualitative/[re]-itself-icfg.png",
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

  // Normalized coordinates inside each 3-row composite qualitative figure.
  // These are intentionally expressed as fractions so the explorer works at any image resolution.
  const qualitativeCropLayout = {
    rows: [
      { y: 0.055, height: 0.265 },
      { y: 0.375, height: 0.265 },
      { y: 0.695, height: 0.265 }
    ],
    regions: {
      query: { x: 0.006, width: 0.19 },
      iapr: { x: 0.225, width: 0.365 },
      base: { x: 0.62, width: 0.365 }
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

  function applyQualitativeCrop(cropElement, image, regionName, caseIndex) {
    const region = qualitativeCropLayout.regions[regionName];
    const row = qualitativeCropLayout.rows[caseIndex];
    if (!region || !row || !image.naturalWidth || !image.naturalHeight) return;

    cropElement.style.setProperty("--qual-crop-image-width", `${(100 / region.width).toFixed(4)}%`);
    cropElement.style.setProperty("--qual-crop-x", `${(-region.x * 100).toFixed(4)}%`);
    cropElement.style.setProperty("--qual-crop-y", `${(-row.y * 100).toFixed(4)}%`);
    const cropRatio = (region.width * image.naturalWidth) / (row.height * image.naturalHeight);
    cropElement.style.aspectRatio = String(cropRatio);
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

    const row = qualitativeCropLayout.rows[activeCase];
    qualRowFocus.style.setProperty("--qual-row-top", `${(row.y * 100).toFixed(3)}%`);
    qualRowFocus.style.setProperty("--qual-row-height", `${(row.height * 100).toFixed(3)}%`);
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
