(() => {
  const motivationHardNegatives = {
    hn1: {
      label: "Candidate B · backpack",
      title: "The overall appearance matches. The backpack construction does not.",
      target: "small plain backpack · thin straps",
      negative: "medium backpack · thick padded straps · front pocket",
      image: "assets/examples/hn_1.png",
      focus: "backpack",
      negativeLabel: "CANDIDATE B · WRONG ID"
    },
    hn2: {
      label: "Candidate C · jacket",
      title: "One construction detail changes the jacket cue.",
      target: "front zipper · subtle side pockets",
      negative: "pullover · kangaroo pocket · no front zipper",
      image: "assets/examples/hn_2.png",
      focus: "jacket",
      negativeLabel: "CANDIDATE C · WRONG ID"
    },
    hn3: {
      label: "Candidate D · shoes",
      title: "The color matches, but the shoe construction changes.",
      target: "plain white low-top sneakers",
      negative: "white high-top sneakers · dark sole",
      image: "assets/examples/hn_3.png",
      focus: "shoes",
      negativeLabel: "CANDIDATE D · WRONG ID"
    },
    hn4: {
      label: "Candidate E · hair + tote side",
      title: "Two small relational cues break the identity match.",
      target: "straight shoulder-length hair · tote in left hand",
      negative: "loose low ponytail · tote in right hand",
      image: "assets/examples/hn_4.png",
      focus: "hair-tote",
      negativeLabel: "CANDIDATE E · WRONG ID"
    }
  };

  const motivationStory = document.querySelector("[data-motivation-story]");
  const motivationBeats = motivationStory ? [...motivationStory.querySelectorAll("[data-motivation-beat]")] : [];
  const motivationScenes = motivationStory ? [...motivationStory.querySelectorAll("[data-motivation-scene]")] : [];
  const motivationCandidates = motivationStory ? [...motivationStory.querySelectorAll("[data-motivation-candidate]")] : [];
  const motivationRevealButton = motivationStory?.querySelector("[data-motivation-reveal]");
  const motivationDetail = motivationStory?.querySelector("[data-motivation-detail]");
  const motivationDetailKicker = motivationStory?.querySelector("[data-motivation-detail-kicker]");
  const motivationDetailTitle = motivationStory?.querySelector("[data-motivation-detail-title]");
  const motivationDetailTarget = motivationStory?.querySelector("[data-motivation-detail-target]");
  const motivationDetailNegative = motivationStory?.querySelector("[data-motivation-detail-negative]");
  const motivationDetailNegativeLabel = motivationStory?.querySelector("[data-motivation-detail-negative-label]");
  const motivationDetailImage = motivationStory?.querySelector("[data-motivation-detail-image]");
  const motivationDetailFigures = motivationStory ? [...motivationStory.querySelectorAll("[data-detail-focus]")] : [];
  let motivationBeat = 1;
  let motivationIdentityRevealed = false;
  let selectedMotivationCandidate = null;

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

  function setMotivationReveal(revealed) {
    if (!motivationStory) return;
    motivationIdentityRevealed = !!revealed;
    motivationStory.classList.toggle("identities-revealed", motivationIdentityRevealed);
    if (motivationRevealButton) {
      motivationRevealButton.textContent = motivationIdentityRevealed ? "Hide identities" : "Reveal identities";
      motivationRevealButton.setAttribute("aria-pressed", String(motivationIdentityRevealed));
    }
  }

  function renderMotivationCandidate(key, { preview = false } = {}) {
    if (!motivationStory) return;
    const isTarget = key === "target";
    const data = motivationHardNegatives[key];
    if (!isTarget && !data) return;

    motivationCandidates.forEach((candidate) => {
      const active = candidate.dataset.motivationCandidate === key;
      candidate.classList.toggle("is-active", active);
      candidate.classList.toggle("is-preview", active && preview);
      candidate.setAttribute("aria-pressed", String(active && !preview));
    });

    if (preview) return;
    selectedMotivationCandidate = key;
    setMotivationReveal(true);
    if (!motivationDetail) return;
    motivationDetail.hidden = false;

    if (isTarget) {
      if (motivationDetailKicker) motivationDetailKicker.textContent = "Candidate A · same identity";
      if (motivationDetailTitle) motivationDetailTitle.textContent = "This candidate is the identity-correct target.";
      if (motivationDetailTarget) motivationDetailTarget.textContent = "query cues + identity-consistent local details";
      if (motivationDetailNegative) motivationDetailNegative.textContent = "same image shown for reference";
      if (motivationDetailNegativeLabel) motivationDetailNegativeLabel.textContent = "CANDIDATE A · SAME ID";
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
    if (motivationDetailImage) {
      motivationDetailImage.src = data.image;
      motivationDetailImage.alt = `${data.label} detail`;
    }
    motivationDetailFigures.forEach((figure) => figure.dataset.focusCue = data.focus);
  }

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
      // Prefer the beat intersected by the reading anchor. Otherwise choose
      // the nearest beat center. This avoids IntersectionObserver threshold gaps.
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

  motivationCandidates.forEach((candidate, index) => {
    const key = candidate.dataset.motivationCandidate;
    candidate.addEventListener("pointerenter", () => {
      if (selectedMotivationCandidate === key) return;
      renderMotivationCandidate(key, { preview: true });
    });
    candidate.addEventListener("pointerleave", () => {
      motivationCandidates.forEach((item) => item.classList.toggle("is-active", item.dataset.motivationCandidate === selectedMotivationCandidate));
      motivationCandidates.forEach((item) => item.classList.remove("is-preview"));
    });
    candidate.addEventListener("focus", () => {
      if (selectedMotivationCandidate !== key) renderMotivationCandidate(key, { preview: true });
    });
    candidate.addEventListener("blur", () => {
      motivationCandidates.forEach((item) => item.classList.toggle("is-active", item.dataset.motivationCandidate === selectedMotivationCandidate));
      motivationCandidates.forEach((item) => item.classList.remove("is-preview"));
    });
    candidate.addEventListener("click", () => renderMotivationCandidate(key));
    candidate.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      motivationCandidates[(index + delta + motivationCandidates.length) % motivationCandidates.length].focus();
    });
  });

  motivationRevealButton?.addEventListener("click", () => setMotivationReveal(!motivationIdentityRevealed));

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

  function setIaprMode(mode, focusButton = false) {
    if (!iaprArchitecture || !["training", "inference"].includes(mode)) return;
    iaprArchitecture.dataset.mode = mode;

    iaprModeButtons.forEach((button) => {
      const selected = button.dataset.iaprMode === mode;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && focusButton) button.focus();
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

  const ablationData = {
    cuhk: {
      label: "CUHK-PEDES",
      rows: [
        ["RDE", 71.09, 64.45, "base retriever"],
        ["+ PM", 70.99, 64.51, "memory alone"],
        ["+ PM + IRA", 71.10, 64.64, "identity restriction"],
        ["+ PM + SSTT", 71.22, 64.72, "same-space transfer"],
        ["Full IAPR", 71.86, 65.41, "PM + IRA + SSTT"]
      ]
    },
    icfg: {
      label: "ICFG-PEDES",
      rows: [
        ["RDE", 63.66, 40.57, "base retriever"],
        ["+ PM", 63.68, 40.74, "memory alone"],
        ["+ PM + IRA", 63.76, 40.81, "identity restriction"],
        ["+ PM + SSTT", 63.90, 40.81, "same-space transfer"],
        ["Full IAPR", 64.25, 42.02, "PM + IRA + SSTT"]
      ]
    },
    rstp: {
      label: "RSTPReid",
      rows: [
        ["RDE", 57.75, 46.53, "base retriever"],
        ["+ PM", 56.50, 44.97, "memory alone"],
        ["+ PM + IRA", 58.30, 45.98, "identity restriction"],
        ["+ PM + SSTT", 60.60, 48.04, "same-space transfer"],
        ["Full IAPR", 61.10, 48.43, "PM + IRA + SSTT"]
      ]
    }
  };

  const ablationChart = document.querySelector("[data-ablation-chart]");
  const ablationTabs = [...document.querySelectorAll("[data-ablation-dataset]")];

  function renderAblation(datasetKey) {
    const data = ablationData[datasetKey];
    if (!data || !ablationChart) return;
    ablationChart.innerHTML = `
      <div class="ablation-chart-head"><strong>${data.label}</strong><span>R@1</span><span>mAP</span></div>
      ${data.rows.map((row, index) => `
        <div class="ablation-row ${index === data.rows.length - 1 ? "is-full" : ""}">
          <div class="ablation-name"><b>${row[0]}</b><small>${row[3]}</small></div>
          <div class="ablation-metric"><span>${row[1].toFixed(2)}</span><i style="--bar:${row[1]}%"></i></div>
          <div class="ablation-metric"><span>${row[2].toFixed(2)}</span><i style="--bar:${row[2]}%"></i></div>
        </div>`).join("")}
    `;
  }

  ablationTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      ablationTabs.forEach((item) => item.setAttribute("aria-selected", String(item === tab)));
      renderAblation(tab.dataset.ablationDataset);
    });
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const next = ablationTabs[(index + delta + ablationTabs.length) % ablationTabs.length];
      next.focus();
      next.click();
    });
  });

  renderAblation("cuhk");

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
