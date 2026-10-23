(() => {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const COLORS = ["#0878F9", "#FF0064", "#D9EF00", "#19B500", "#05083F", "#C8C8C8"];
  const CELL_W = 217.5;
  const CELL_H = 174;
  const GRID_W = CELL_W * 4;
  const GRID_H = CELL_H * 5;
  const appState = {
    autoColors: true,
    gradientMode: "flat",
    gradientIntensity: 45,
    gradientAngle: 35,
    circleRange: 12,
    circleXRange: 8,
    circleYRange: 12,
    bodyRange: 5,
    horizontalRange: 12,
    verticalRange: 12,
    colors: [],
    gradients: [],
  };
  const poster = document.getElementById("poster");
  const grid = document.getElementById("poster-grid");
  const defs = document.getElementById("poster-defs");
  const mergeLayer = document.getElementById("merge-layer");
  const motionMessage = document.getElementById("motion-message");

  const cells = [
    { bg: 2, fg: 1, shape: "person", head: [100, 35, 19] },
    { bg: 1, fg: 3, shape: "lean", head: [101, 61, 10] },
    { bg: 3, fg: 0, shape: "lean", head: [79, 39, 19] },
    { bg: 4, fg: 5, shape: "dome", head: [101, 70, 26] },
    { bg: 0, fg: 4, shape: "person", head: [76, 19, 25] },
    { bg: 4, fg: 4, shape: "none", head: [103, 160, 37] },
    { bg: 5, fg: 1, shape: "person", head: [103, 34, 27] },
    { bg: 2, fg: 3, shape: "lean", head: [40, 35, 19] },
    { bg: 5, fg: 0, shape: "hill", head: [43, 50, 15] },
    { bg: 1, fg: 5, shape: "arch", head: [106, 29, 16] },
    { bg: 3, fg: 4, shape: "block", head: [76, 43, 12] },
    { bg: 0, fg: 2, shape: "dome", head: [102, 29, 27] },
    { bg: 4, fg: 1, shape: "lowHill", heads: [[137, 88, 23], [187, 88, 17]] },
    { bg: 3, fg: 2, shape: "cone", heads: [[69, 88, 17], [94, 88, 17]] },
    { bg: 2, fg: 3, shape: "hill", head: [100, 53, 62] },
    { bg: 5, fg: 0, shape: "slope", head: [2, 44, 24] },
    { bg: 2, fg: 0, shape: "tinyHill", head: [38, 115, 15] },
    { bg: 0, fg: 3, shape: "person", head: [100, 34, 30] },
    { bg: 4, fg: 4, shape: "none" },
    { bg: 1, fg: 2, shape: "hill", head: [106, 54, 19] },
  ];

  const shapes = {
    person: "M22 174 L37 105 Q44 77 68 75 L132 75 Q157 78 164 105 L180 174 Z",
    lean: "M20 174 L55 100 Q63 78 86 77 L110 77 Q131 79 143 103 L182 174 Z",
    dome: "M4 174 Q30 112 69 102 Q101 94 132 102 Q178 117 213 174 Z",
    hill: "M0 174 Q30 132 79 117 Q143 96 217.5 174 Z",
    arch: "M0 174 L0 125 Q0 94 31 91 L184 91 Q217.5 94 217.5 125 L217.5 174 Z",
    block: "M0 174 L0 121 Q0 88 35 88 L182 88 Q217.5 88 217.5 121 L217.5 174 Z",
    lowHill: "M0 174 Q40 142 91 120 Q155 95 217.5 174 Z",
    cone: "M36 174 Q59 122 77 92 Q89 72 101 82 Q122 99 151 174 Z",
    slope: "M0 174 L0 117 Q0 101 33 101 L102 101 Q123 103 141 125 L194 174 Z",
    tinyHill: "M0 174 Q26 148 60 146 Q86 144 108 174 Z",
  };

  const nodes = [];

  function element(name, attrs = {}, parent = null) {
    const node = document.createElementNS(NS, name);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
    if (parent) parent.appendChild(node);
    return node;
  }

  function buildGradientLoop() {
    const state = { angle: 0 };
    const loop = gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } });
    loop.to(state, {
      angle: 18,
      duration: 5,
      repeat: 1,
      yoyo: true,
      onUpdate: () => {
        nodes.forEach((cell) => {
          [cell.bgGradient, cell.bodyGradient, cell.circleGradient].forEach((gradient) => {
            gradient.node.setAttribute("gradientTransform", `rotate(${state.angle} .5 .5)`);
          });
        });
      },
    });
    loop.duration(20);
    return loop;
  }

  function buildPoster() {
    cells.forEach((cell, index) => {
      const rowIndex = Math.floor(index / 4);
      const columnIndex = index % 4;
      if (columnIndex === 0) {
        const rowBase = element("g", { transform: `translate(0 ${rowIndex * CELL_H})` }, grid);
        const row = element("g", {}, rowBase);
        cell.row = row;
      } else {
        cell.row = cells[index - 1].row;
      }

      const clipId = `cell-clip-${index}`;
      const clip = element("clipPath", { id: clipId, clipPathUnits: "userSpaceOnUse" }, defs);
      element("rect", { x: 0, y: 0, width: CELL_W, height: CELL_H }, clip);

      const tile = element("g", { transform: `translate(${columnIndex * CELL_W} 0)` }, cell.row);
      const layout = element("g", {}, tile);
      const block = element("g", {}, layout);
      const artwork = element("g", { "clip-path": `url(#${clipId})` }, block);
      const background = element(
        "rect",
        { x: 0, y: 0, width: CELL_W, height: CELL_H, fill: COLORS[cell.bg] },
        artwork,
      );
      const bgGradient = createGradient(`background-${index}`);
      const bodyGradient = createGradient(`body-${index}`);
      const circleGradient = createGradient(`circle-${index}`);
      let body = null;
      if (cell.shape !== "none") {
        const bodyMotion = element("g", { class: "body-motion" }, artwork);
        body = element("path", { d: shapes[cell.shape], fill: COLORS[cell.fg] }, bodyMotion);
      }
      const heads = cell.heads || (cell.head ? [cell.head] : []);
      const headMotions = heads.map(([cx, cy, radius], headIndex) => {
        const motion = element(
          "g",
          { class: "head-motion", transform: "translate(0 0)" },
          artwork,
        );
        element(
          "circle",
          {
            cx,
            cy,
            r: radius,
            fill: "#FFFFFF",
            class: "head-circle",
            "data-radius": radius,
            "data-head-index": headIndex,
          },
          motion,
        );
        return motion;
      });

      cell.index = index;
      cell.bgIndex = cell.bg;
      cell.fgIndex = cell.fg;
      cell.bgNode = background;
      cell.bodyNode = body;
      cell.bgGradient = bgGradient;
      cell.bodyGradient = bodyGradient;
      cell.circleGradient = circleGradient;
      cell.tileNode = tile;
      cell.layoutNode = layout;
      cell.blockNode = block;
      cell.headNodes = headMotions;
      cell.circleNodes = headMotions.map((head) => head.querySelector("circle"));
      cell.baseBg = COLORS[cell.bg];
      cell.baseFg = COLORS[cell.fg];
      cell.baseCircle = "#FFFFFF";
      cell.bgColor = cell.baseBg;
      cell.fgColor = cell.baseFg;
      cell.circleColor = cell.baseCircle;
      cell.colorProxy = { bgColor: cell.bgColor, fgColor: cell.fgColor };
      cell.rowIndex = rowIndex;
      cell.columnIndex = columnIndex;
      appState.colors.push({ bg: cell.baseBg, fg: cell.baseFg, circle: cell.baseCircle });
      nodes.push(cell);
    });

    createMergePanels();
  }

  function createGradient(name) {
    const gradient = element(
      "linearGradient",
      { id: `${name}-gradient`, x1: "0%", y1: "0%", x2: "100%", y2: "100%" },
      defs,
    );
    const first = element("stop", { offset: "0%", "stop-color": "#ffffff" }, gradient);
    const second = element("stop", { offset: "100%", "stop-color": "#000000" }, gradient);
    return { node: gradient, stops: [first, second], id: `${name}-gradient`, kind: "linear" };
  }

  function createMergePanels() {
    const panelSpecs = [
      { row: 0, column: 1 },
      { row: 2, column: 2 },
      { row: 4, column: 0 },
    ];

    panelSpecs.forEach(({ row, column }, panelIndex) => {
      const merged = element(
        "g",
        {
          class: "merge-panel",
          transform: `translate(${column * CELL_W} ${row * CELL_H})`,
          opacity: 0,
          "data-panel": panelIndex,
        },
        mergeLayer,
      );
      const backgroundA = element(
        "rect",
        { x: 0, y: 0, width: CELL_W, height: CELL_H, fill: COLORS[cells[row * 4 + column].bg] },
        merged,
      );
      const backgroundB = element(
        "rect",
        {
          x: CELL_W,
          y: 0,
          width: CELL_W,
          height: CELL_H,
          fill: COLORS[cells[row * 4 + column + 1].bg],
        },
        merged,
      );
      const body = element(
        "path",
        {
          d: `M18 ${CELL_H} Q36 100 104 91 L${CELL_W * 2 - 106} 91 Q${CELL_W * 2 - 28} 97 ${CELL_W * 2 - 15} ${CELL_H} Z`,
          fill: COLORS[cells[row * 4 + column].fg],
        },
        merged,
      );
      const head = element(
        "circle",
        { cx: CELL_W, cy: 50, r: 31, fill: "#FFFFFF" },
        merged,
      );
      nodes.mergePanels ||= [];
      nodes.mergePanels.push({
        row,
        column,
        group: merged,
        backgroundA,
        backgroundB,
        body,
        head,
      });
    });
  }

  function targetColor(cell, phase, role) {
    const currentIndex = role === "background" ? cell.bgIndex : cell.fgIndex;
    const drift = ((cell.index % 5) + phase * (role === "background" ? 2 : 3)) % COLORS.length;
    let nextIndex = (currentIndex + drift + phase) % COLORS.length;
    if (role === "foreground" && nextIndex === currentIndex) {
      nextIndex = (nextIndex + 1 + (cell.index % 2)) % COLORS.length;
    }
    return COLORS[nextIndex];
  }

  function normalizeHex(color) {
    if (typeof color !== "string") return "#000000";
    const hex = color.match(/^#?([0-9a-f]{6})$/i);
    if (hex) return `#${hex[1].toUpperCase()}`;
    const channels = color.match(/^rgba?\(([^)]+)\)$/i);
    if (channels) {
      const values = channels[1].match(/[\d.]+/g).slice(0, 3).map(Number);
      return `#${values.map((value) => Math.round(value).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
    }
    return "#000000";
  }

  function colorMix(color, mixColor, amount) {
    color = normalizeHex(color);
    mixColor = normalizeHex(mixColor);
    const from = color.match(/[0-9a-f]{2}/gi).map((part) => parseInt(part, 16));
    const to = mixColor.match(/[0-9a-f]{2}/gi).map((part) => parseInt(part, 16));
    return `#${from.map((channel, index) => Math.round(channel + (to[index] - channel) * amount).toString(16).padStart(2, "0")).join("")}`;
  }

  function paintColor(cell, role) {
    const color = role === "background" ? cell.bgColor : role === "body" ? cell.fgColor : cell.circleColor;
    const gradient = role === "background" ? cell.bgGradient : role === "body" ? cell.bodyGradient : cell.circleGradient;
    const mode = appState.gradientMode;
    if (mode === "flat") return color;
    const intensity = appState.gradientIntensity / 100 * (mode === "subtle" ? 0.38 : mode === "radial" ? 0.66 : 0.8);
    gradient.stops[0].setAttribute("stop-color", colorMix(color, "#FFFFFF", intensity));
    gradient.stops[1].setAttribute("stop-color", colorMix(color, "#05083F", intensity * 0.45));
    const useRadial = mode === "radial";
    if (gradient.kind !== (useRadial ? "radial" : "linear")) {
      const replacement = element(useRadial ? "radialGradient" : "linearGradient", { id: gradient.id });
      gradient.stops.forEach((stop) => replacement.appendChild(stop));
      gradient.node.replaceWith(replacement);
      gradient.node = replacement;
      gradient.kind = useRadial ? "radial" : "linear";
    }
    if (useRadial) {
      gradient.node.setAttribute("cx", "50%");
      gradient.node.setAttribute("cy", "50%");
      gradient.node.setAttribute("r", "72%");
    } else {
      const angle = appState.gradientAngle * Math.PI / 180;
      gradient.node.setAttribute("x1", `${50 - Math.cos(angle) * 50}%`);
      gradient.node.setAttribute("y1", `${50 - Math.sin(angle) * 50}%`);
      gradient.node.setAttribute("x2", `${50 + Math.cos(angle) * 50}%`);
      gradient.node.setAttribute("y2", `${50 + Math.sin(angle) * 50}%`);
    }
    return `url(#${gradient.id})`;
  }

  function renderCellColors(cell) {
    cell.bgNode.setAttribute("fill", paintColor(cell, "background"));
    if (cell.bodyNode) cell.bodyNode.setAttribute("fill", paintColor(cell, "body"));
    cell.circleNodes.forEach((circle) => circle.setAttribute("fill", paintColor(cell, "circle")));
  }

  function buildColorLoop() {
    const palette = gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } });
    const moments = [
      { time: 2, phase: 1 },
      { time: 6, phase: 2 },
      { time: 10, phase: 3 },
      { time: 14, phase: 2 },
      { time: 18, phase: 0 },
    ];

    moments.forEach(({ time, phase }) => {
      nodes.forEach((cell) => {
        const stagger = ((cell.index * 7) % 9) * 0.045;
        const duration = 1.05 + (cell.index % 3) * 0.11;
        palette.to(cell.colorProxy, {
          bgColor: phase === 0 ? cell.baseBg : targetColor(cell, phase, "background"),
          fgColor: phase === 0 ? cell.baseFg : targetColor(cell, phase, "foreground"),
          duration,
          onUpdate: () => {
            cell.bgColor = normalizeHex(cell.colorProxy.bgColor);
            cell.fgColor = normalizeHex(cell.colorProxy.fgColor);
            renderCellColors(cell);
          },
        }, time + stagger);
      });
    });
    palette.duration(20);
    return palette;
  }

  function buildMotionLoops() {
    const circleLoop = gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } });
    const bodyLoop = gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } });
    const gridLoop = gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } });
    const blockLoop = gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } });
    const zoomLoop = gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } });
    nodes.forEach((cell) => {
      const { index } = cell;
      const delay = ((index * 13) % 19) * 0.12;
      const up = 4 + ((index * 7) % 11);
      const side = ((index % 5) - 2) * 3.3;
      const duration = 1.45 + (index % 4) * 0.2;

      cell.headNodes.forEach((head, headIndex) => {
        const headSide = side * (headIndex % 2 === 0 ? 1 : -1) * 0.65;
        circleLoop.to(
          head,
          {
            x: headSide * (appState.circleXRange / 8),
            y: -up * (headIndex === 0 ? 1 : 0.7) * (appState.circleYRange / 12),
            duration: duration + headIndex * 0.18,
            repeat: 1,
            yoyo: true,
            ease: "sine.inOut",
          },
          delay,
        );
        if (index % 3 === 0 && headIndex === 0) {
          const circle = head.querySelector("circle");
          circleLoop.to(
            circle,
            { scale: 1.06, transformOrigin: "50% 50%", duration: 1.05, repeat: 1, yoyo: true },
            delay + 0.2,
          );
        }
      });

      if (cell.bodyNode) {
        const bodyMotion = cell.bodyNode.parentNode;
        bodyLoop.to(
          bodyMotion,
          {
            scaleX: 1 + ((index % 3) - 1) * (appState.bodyRange / 100),
            scaleY: 1 + (index % 2 ? 1 : -0.8) * (appState.bodyRange / 100),
            transformBox: "fill-box",
            transformOrigin: "50% 100%",
            duration: 1.6 + (index % 3) * 0.25,
            repeat: 1,
            yoyo: true,
          },
          delay + 0.15,
        );
      }
    });

    [1, 3].forEach((rowIndex, index) => {
      gridLoop.to(
        cells[rowIndex * 4].row,
        {
          x: (index % 2 ? 7 : -8) * (appState.horizontalRange / 12),
          duration: 0.8,
          repeat: 1,
          yoyo: true,
          ease: "power2.inOut",
        },
        8 + index * 0.4,
      );
    });

    [0, 2, 3].forEach((columnIndex, index) => {
      nodes
        .filter((cell) => cell.columnIndex === columnIndex)
        .forEach((cell) => {
          blockLoop.to(
            cell.blockNode,
            {
              y: (index % 2 ? 5 : -6) * (appState.verticalRange / 12),
              duration: 0.72,
              repeat: 1,
              yoyo: true,
              ease: "power2.inOut",
            },
            12 + index * 0.3 + cell.rowIndex * 0.07,
          );
        });
    });

    nodes.forEach((cell, index) => {
      zoomLoop.to(
        cell.blockNode,
        {
          scale: index % 2 ? 1.025 : 0.975,
          transformOrigin: "50% 50%",
          duration: 1.1 + (index % 4) * 0.15,
          repeat: 1,
          yoyo: true,
        },
        (index * 0.29) % 8,
      );
    });

    [circleLoop, bodyLoop, gridLoop, blockLoop, zoomLoop].forEach((timeline) => timeline.duration(20));
    return { circleLoop, bodyLoop, gridLoop, blockLoop, zoomLoop };
  }

  function setupControls(motionLoops, paletteLoop, gradientLoop) {
    const playButton = document.getElementById("play-toggle");
    const playLabel = playButton.querySelector(".play-label");
    const frameState = document.getElementById("frame-state");
    const speed = document.getElementById("speed");
    const speedValue = document.getElementById("speed-value");
    const activeTimelines = new Set();
    const speedValues = {
      overall: 1,
      circle: 1,
      body: 1,
      block: 1,
      row: 1,
      rotation: 1,
      zoom: 1,
      color: 1,
      gradient: 1,
    };
    const actionButtons = [
      document.getElementById("color-swap"),
      document.getElementById("grid-shift"),
      document.getElementById("merge-blocks"),
    ];
    let colorAction = null;
    let motionAction = null;
    let mergeAction = null;
    let wantsPlay = true;
    let structuralAction = false;
    let rotationAction = null;
    let gridAction = null;
    let spinAction = null;

    function isPlaying() {
      return wantsPlay;
    }

    function setActionsDisabled(disabled) {
      actionButtons.forEach((button) => {
        button.disabled = disabled;
      });
    }

    function setPlaying(shouldPlay) {
      wantsPlay = shouldPlay;
      if (shouldPlay && !structuralAction) {
        Object.values(motionLoops).forEach((timeline) => timeline.resume());
        gradientLoop.resume();
        if (rotationAction) rotationAction.resume();
      } else {
        Object.values(motionLoops).forEach((timeline) => timeline.pause());
        gradientLoop.pause();
        if (rotationAction) rotationAction.pause();
      }
      if (shouldPlay && !structuralAction && !colorAction && appState.autoColors) {
        paletteLoop.resume();
      } else {
        paletteLoop.pause();
      }
      activeTimelines.forEach((timeline) => {
        if (shouldPlay) timeline.resume();
        else timeline.pause();
      });
      document.getElementById("timeline-time").textContent =
        `${motionLoops.gridLoop.time().toFixed(1).padStart(4, "0")} s`;
      if (shouldPlay) {
        playButton.setAttribute("aria-pressed", "true");
        playLabel.textContent = "Pause the poster";
        frameState.textContent = "IN MOTION";
      } else {
        playButton.setAttribute("aria-pressed", "false");
        playLabel.textContent = "Play the poster";
        frameState.textContent = "AT REST";
      }
    }

    function runAction(timeline, onDone) {
      activeTimelines.add(timeline);
      if (!wantsPlay) timeline.pause();
      timeline.eventCallback("onComplete", () => {
        activeTimelines.delete(timeline);
        if (onDone) onDone();
      });
    }

    playButton.addEventListener("click", () => setPlaying(!isPlaying()));

    speed.addEventListener("input", () => {
      const rate = Number(speed.value);
      speedValues.overall = rate;
      document.getElementById("overall-speed").value = String(rate);
      document.querySelector('[data-output="overall-speed"]').textContent = `${rate.toFixed(2)}×`;
      applySpeeds();
      speedValue.value = `${rate.toFixed(1)}×`;
      speedValue.textContent = speedValue.value;
    });

    function applySpeeds() {
      motionLoops.circleLoop.timeScale(speedValues.overall * speedValues.circle);
      motionLoops.bodyLoop.timeScale(speedValues.overall * speedValues.body);
      motionLoops.gridLoop.timeScale(speedValues.overall * speedValues.row);
      motionLoops.blockLoop.timeScale(speedValues.overall * speedValues.block);
      motionLoops.zoomLoop.timeScale(speedValues.overall * speedValues.zoom);
      paletteLoop.timeScale(speedValues.overall * speedValues.color);
      gradientLoop.timeScale(speedValues.overall * speedValues.gradient);
      if (rotationAction) rotationAction.timeScale(speedValues.overall * speedValues.rotation);
      if (colorAction) colorAction.timeScale(speedValues.overall * speedValues.color);
      if (motionAction) motionAction.timeScale(speedValues.overall * speedValues.row);
      if (mergeAction) mergeAction.timeScale(speedValues.overall * speedValues.block);
      if (gridAction) gridAction.timeScale(speedValues.overall * speedValues.block);
      if (spinAction) spinAction.timeScale(speedValues.overall * speedValues.rotation);
    }

    const speedControls = [
      ["overall-speed", "overall", "×"],
      ["circle-speed", "circle", "×"],
      ["body-speed", "body", "×"],
      ["block-speed", "block", "×"],
      ["row-speed", "row", "×"],
      ["rotation-speed", "rotation", "×"],
      ["zoom-speed", "zoom", "×"],
      ["color-speed", "color", "×"],
      ["gradient-speed", "gradient", "×"],
    ];
    speedControls.forEach(([id, key, suffix]) => {
      const input = document.getElementById(id);
      input.addEventListener("input", () => {
        speedValues[key] = Number(input.value);
        document.querySelector(`[data-output="${id}"]`).textContent =
          `${speedValues[key].toFixed(2)}${suffix}`;
        if (key === "overall") {
          speed.value = input.value;
          speedValue.value = `${speedValues.overall.toFixed(1)}×`;
          speedValue.textContent = speedValue.value;
        }
        applySpeeds();
      });
    });

    motionLoops.gridLoop.eventCallback("onUpdate", () => {
      const progress = motionLoops.gridLoop.progress() * 100;
      const slider = document.getElementById("timeline-progress");
      if (document.activeElement !== slider) slider.value = String(progress);
      document.getElementById("timeline-time").textContent =
        `${motionLoops.gridLoop.time().toFixed(1).padStart(4, "0")} s`;
    });

    document.getElementById("timeline-progress").addEventListener("input", (event) => {
      const progress = Number(event.currentTarget.value) / 100;
      Object.values(motionLoops).forEach((timeline) => timeline.progress(progress));
      paletteLoop.progress(progress);
      gradientLoop.progress(progress);
    });

    document.getElementById("loop-enabled").addEventListener("change", (event) => {
      Object.values(motionLoops).forEach((timeline) => timeline.repeat(event.currentTarget.checked ? -1 : 0));
      paletteLoop.repeat(event.currentTarget.checked ? -1 : 0);
      gradientLoop.repeat(event.currentTarget.checked ? -1 : 0);
    });

    document.getElementById("auto-colors").addEventListener("change", (event) => {
      appState.autoColors = event.currentTarget.checked;
      if (appState.autoColors && wantsPlay) paletteLoop.resume();
      else paletteLoop.pause();
    });

    document.getElementById("animate-circles").addEventListener("change", (event) => {
      if (event.currentTarget.checked && wantsPlay) motionLoops.circleLoop.resume();
      else motionLoops.circleLoop.pause();
    });
    function syncBodyAnimation() {
      const enabled = document.getElementById("animate-bodies").checked &&
        document.getElementById("morph-shapes").checked;
      if (enabled && wantsPlay) motionLoops.bodyLoop.resume();
      else motionLoops.bodyLoop.pause();
    }
    document.getElementById("animate-bodies").addEventListener("change", syncBodyAnimation);
    document.getElementById("morph-shapes").addEventListener("change", syncBodyAnimation);
    document.getElementById("animate-rows").addEventListener("change", (event) => {
      gsap.set(cells[0].row, { x: 0 });
      if (!event.currentTarget.checked) motionLoops.gridLoop.pause();
      else if (wantsPlay) motionLoops.gridLoop.resume();
    });
    document.getElementById("animate-columns").addEventListener("change", (event) => {
      if (!event.currentTarget.checked) motionLoops.blockLoop.pause();
      else if (wantsPlay) motionLoops.blockLoop.resume();
    });
    document.getElementById("animate-rotation").addEventListener("change", (event) => {
      if (!event.currentTarget.checked && rotationAction) {
        rotationAction.kill();
        rotationAction = null;
        nodes.forEach((cell) => gsap.set(cell.blockNode, { rotation: 0 }));
      } else if (event.currentTarget.checked) {
        startBlockRotation();
      }
    });

    function populateColorFields() {
      const select = document.getElementById("selected-cell");
      const selected = select.value === "all" ? null : nodes[Number(select.value)];
      const first = selected || nodes[0];
      document.getElementById("pick-background").value = normalizeHex(first.bgColor);
      document.getElementById("pick-body").value = normalizeHex(first.fgColor);
      document.getElementById("pick-circle").value = normalizeHex(first.circleColor);
    }

    nodes.forEach((cell, index) => {
      cell.bgColor = appState.colors[index].bg;
      cell.fgColor = appState.colors[index].fg;
      cell.circleColor = appState.colors[index].circle;
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `Block ${String(index + 1).padStart(2, "0")} · row ${cell.rowIndex + 1}, column ${cell.columnIndex + 1}`;
      document.getElementById("selected-cell").appendChild(option);
    });

    document.getElementById("selected-cell").addEventListener("change", populateColorFields);
    function applySelectedColors() {
      const selected = document.getElementById("selected-cell").value;
      const targets = selected === "all" ? nodes : [nodes[Number(selected)]];
      targets.forEach((cell) => {
        cell.bgColor = document.getElementById("pick-background").value.toUpperCase();
        cell.fgColor = document.getElementById("pick-body").value.toUpperCase();
        cell.circleColor = document.getElementById("pick-circle").value.toUpperCase();
        cell.colorProxy.bgColor = cell.bgColor;
        cell.colorProxy.fgColor = cell.fgColor;
        renderCellColors(cell);
      });
    }
    document.getElementById("apply-colors").addEventListener("click", applySelectedColors);
    ["pick-background", "pick-body", "pick-circle"].forEach((id) => {
      document.getElementById(id).addEventListener("input", applySelectedColors);
    });

    document.getElementById("randomize-colors").addEventListener("click", () => {
      const selected = document.getElementById("selected-cell").value;
      const targets = selected === "all" ? nodes : [nodes[Number(selected)]];
      targets.forEach((cell) => {
        cell.bgColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        cell.fgColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        cell.circleColor = Math.random() > 0.5 ? "#FFFFFF" : COLORS[Math.floor(Math.random() * COLORS.length)];
        cell.colorProxy.bgColor = cell.bgColor;
        cell.colorProxy.fgColor = cell.fgColor;
        renderCellColors(cell);
      });
      populateColorFields();
    });

    document.getElementById("gradient-mode").addEventListener("change", (event) => {
      appState.gradientMode = event.currentTarget.value;
      nodes.forEach(renderCellColors);
    });
    ["gradient-angle", "gradient-intensity"].forEach((id) => {
      const input = document.getElementById(id);
      input.addEventListener("input", () => {
        appState[id === "gradient-angle" ? "gradientAngle" : "gradientIntensity"] = Number(input.value);
        document.querySelector(`[data-output="${id}"]`).textContent =
          `${input.value}${id === "gradient-angle" ? "°" : "%"}`;
        nodes.forEach(renderCellColors);
      });
    });

    function readPalette() {
      return nodes.map((cell) => ({
        bg: normalizeHex(cell.bgColor),
        fg: normalizeHex(cell.fgColor),
        circle: normalizeHex(cell.circleColor),
      }));
    }

    function applyPalette(palette) {
      nodes.forEach((cell, index) => {
        const colors = palette[index % palette.length];
        cell.bgColor = colors.bg;
        cell.fgColor = colors.fg;
        cell.circleColor = colors.circle;
        cell.colorProxy.bgColor = cell.bgColor;
        cell.colorProxy.fgColor = cell.fgColor;
        renderCellColors(cell);
      });
      populateColorFields();
    }

    const savedPalettes = document.getElementById("saved-palettes");
    function refreshSavedPalettes() {
      savedPalettes.replaceChildren(new Option("Choose a saved palette", ""));
      try {
        const stored = JSON.parse(localStorage.getItem("people-in-blocks-palettes") || "{}");
        Object.keys(stored).forEach((name) => savedPalettes.add(new Option(name, name)));
      } catch (error) {
        console.warn("Saved palettes could not be loaded.", error);
      }
    }
    refreshSavedPalettes();
    document.getElementById("save-palette").addEventListener("click", () => {
      try {
        const stored = JSON.parse(localStorage.getItem("people-in-blocks-palettes") || "{}");
        let number = Object.keys(stored).length + 1;
        let label = `Custom palette ${number}`;
        while (stored[label]) {
          number += 1;
          label = `Custom palette ${number}`;
        }
        stored[label] = readPalette();
        localStorage.setItem("people-in-blocks-palettes", JSON.stringify(stored));
        refreshSavedPalettes();
        savedPalettes.value = label;
        document.querySelector(".palette-copy").textContent = `${label} saved in this browser.`;
      } catch (error) {
        console.error("Could not save the color palette.", error);
        document.querySelector(".palette-copy").textContent = "Palette could not be saved. Check browser storage settings.";
      }
    });
    savedPalettes.addEventListener("change", () => {
      if (!savedPalettes.value) return;
      const stored = JSON.parse(localStorage.getItem("people-in-blocks-palettes") || "{}");
      if (stored[savedPalettes.value]) applyPalette(stored[savedPalettes.value]);
    });
    document.getElementById("restore-colors").addEventListener("click", () => {
      nodes.forEach((cell, index) => {
        cell.bgColor = cell.baseBg;
        cell.fgColor = cell.baseFg;
        cell.circleColor = cell.baseCircle;
        cell.colorProxy.bgColor = cell.bgColor;
        cell.colorProxy.fgColor = cell.fgColor;
        renderCellColors(cell);
      });
      populateColorFields();
    });

    [["horizontal-range", "horizontalRange"], ["vertical-range", "verticalRange"],
      ["circle-x-range", "circleXRange"], ["circle-y-range", "circleYRange"]].forEach(([id, key]) => {
      document.getElementById(id).addEventListener("input", (event) => {
        appState[key] = Number(event.currentTarget.value);
        document.querySelector(`[data-output="${id}"]`).textContent = `${event.currentTarget.value} px`;
      });
    });
    document.getElementById("grid-gap").addEventListener("input", (event) => {
      const gap = Number(event.currentTarget.value);
      document.querySelector('[data-output="grid-gap"]').textContent = `${gap} px`;
      nodes.forEach((cell) => {
        const centerX = (cell.columnIndex - 1.5) * gap;
        const centerY = (cell.rowIndex - 2) * gap;
        gsap.to(cell.layoutNode, { x: centerX, y: centerY, duration: 0.25 });
      });
    });
    document.getElementById("cell-size").addEventListener("input", (event) => {
      const scale = Number(event.currentTarget.value) / 100;
      document.querySelector('[data-output="cell-size"]').textContent = `${event.currentTarget.value}%`;
      selectedShapeTargets().forEach((cell) => {
        gsap.to(cell.layoutNode, { scale, transformOrigin: "50% 50%", duration: 0.25 });
      });
    });
    document.getElementById("grid-rotation").addEventListener("input", (event) => {
      const angle = Number(event.currentTarget.value);
      document.querySelector('[data-output="grid-rotation"]').textContent = `${angle}°`;
      if (rotationAction) {
        rotationAction.kill();
        rotationAction = null;
        document.getElementById("animate-rotation").checked = false;
      }
      selectedShapeTargets().forEach((cell, index) => {
        gsap.to(cell.blockNode, { rotation: angle * rotationSign(index), transformOrigin: "50% 50%", duration: 0.3 });
      });
    });
    function selectedShapeTargets() {
      const selected = document.getElementById("selected-cell").value;
      return selected === "all" ? nodes : [nodes[Number(selected)]];
    }

    document.getElementById("shape-size").addEventListener("input", (event) => {
      const scale = Number(event.currentTarget.value) / 100;
      document.querySelector('[data-output="shape-size"]').textContent = `${event.currentTarget.value}%`;
      selectedShapeTargets().forEach((cell) => {
        if (cell.headNodes.length) gsap.to(cell.headNodes, { scale, transformOrigin: "50% 50%", duration: 0.25 });
        if (cell.bodyNode) gsap.to(cell.bodyNode.parentNode, { scale, transformOrigin: "50% 100%", duration: 0.25 });
      });
    });
    document.getElementById("shape-rotation").addEventListener("input", (event) => {
      const angle = Number(event.currentTarget.value);
      document.querySelector('[data-output="shape-rotation"]').textContent = `${angle}°`;
      selectedShapeTargets().forEach((cell) => {
        if (cell.bodyNode) gsap.to(cell.bodyNode.parentNode, { rotation: angle, transformOrigin: "50% 100%", duration: 0.25 });
        if (cell.headNodes.length) {
          gsap.to(cell.headNodes, { rotation: -angle * 0.5, transformOrigin: "50% 50%", duration: 0.25 });
        }
      });
    });
    document.getElementById("circle-size").addEventListener("input", (event) => {
      const scale = Number(event.currentTarget.value) / 100;
      document.querySelector('[data-output="circle-size"]').textContent = `${event.currentTarget.value}%`;
      selectedShapeTargets().forEach((cell) => {
        if (cell.headNodes.length) gsap.to(cell.headNodes, { scale, transformOrigin: "50% 50%", duration: 0.25 });
      });
    });
    document.getElementById("body-size").addEventListener("input", (event) => {
      const scale = Number(event.currentTarget.value) / 100;
      document.querySelector('[data-output="body-size"]').textContent = `${event.currentTarget.value}%`;
      selectedShapeTargets().forEach((cell) => {
        if (cell.bodyNode) gsap.to(cell.bodyNode.parentNode, { scale, transformOrigin: "50% 100%", duration: 0.25 });
      });
    });
    document.getElementById("circle-rotation").addEventListener("input", (event) => {
      const angle = Number(event.currentTarget.value);
      document.querySelector('[data-output="circle-rotation"]').textContent = `${angle}°`;
      selectedShapeTargets().forEach((cell) => {
        if (cell.headNodes.length) gsap.to(cell.headNodes, { rotation: angle, transformOrigin: "50% 50%", duration: 0.25 });
      });
    });
    document.getElementById("body-rotation").addEventListener("input", (event) => {
      const angle = Number(event.currentTarget.value);
      document.querySelector('[data-output="body-rotation"]').textContent = `${angle}°`;
      selectedShapeTargets().forEach((cell) => {
        if (cell.bodyNode) gsap.to(cell.bodyNode.parentNode, { rotation: angle, transformOrigin: "50% 100%", duration: 0.25 });
      });
    });
    document.getElementById("circle-range").addEventListener("input", (event) => {
      appState.circleRange = Number(event.currentTarget.value);
      appState.circleXRange = appState.circleRange;
      appState.circleYRange = appState.circleRange;
      document.getElementById("circle-x-range").value = event.currentTarget.value;
      document.getElementById("circle-y-range").value = event.currentTarget.value;
      document.querySelector('[data-output="circle-x-range"]').textContent = `${event.currentTarget.value} px`;
      document.querySelector('[data-output="circle-y-range"]').textContent = `${event.currentTarget.value} px`;
      document.querySelector('[data-output="circle-range"]').textContent = `${event.currentTarget.value} px`;
    });
    document.getElementById("body-range").addEventListener("input", (event) => {
      appState.bodyRange = Number(event.currentTarget.value);
      document.querySelector('[data-output="body-range"]').textContent = `${event.currentTarget.value}%`;
    });

    function rebuildMotionLoops() {
      const progress = motionLoops.gridLoop.progress();
      Object.values(motionLoops).forEach((timeline) => timeline.kill());
      Object.assign(motionLoops, buildMotionLoops());
      applySpeeds();
      Object.values(motionLoops).forEach((timeline) => {
        timeline.progress(progress);
        if (!wantsPlay) timeline.pause();
      });
      if (!document.getElementById("animate-circles").checked) motionLoops.circleLoop.pause();
      if (!document.getElementById("animate-bodies").checked) motionLoops.bodyLoop.pause();
      if (!document.getElementById("animate-rows").checked) motionLoops.gridLoop.pause();
      if (!document.getElementById("animate-columns").checked) motionLoops.blockLoop.pause();
    }

    ["horizontal-range", "vertical-range", "circle-range", "circle-x-range",
      "circle-y-range", "body-range"].forEach((id) => {
      document.getElementById(id).addEventListener("change", rebuildMotionLoops);
    });

    function rotationSign(index) {
      const direction = document.getElementById("rotation-direction").value;
      if (direction === "clockwise") return 1;
      if (direction === "counterclockwise") return -1;
      return index % 2 ? 1 : -1;
    }

    function startBlockRotation() {
      if (rotationAction) rotationAction.kill();
      rotationAction = gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } });
      nodes.forEach((cell, index) => {
        rotationAction.to(
          cell.blockNode,
          { rotation: rotationSign(index) * 7, duration: 1.3, repeat: 1, yoyo: true, transformOrigin: "50% 50%" },
          (index * 0.37) % 8,
        );
      });
      rotationAction.duration(20);
      rotationAction.timeScale(speedValues.overall * speedValues.rotation);
      if (!wantsPlay) rotationAction.pause();
    }
    document.getElementById("rotation-direction").addEventListener("change", () => {
      if (rotationAction) startBlockRotation();
    });

    function rearrangeGrid() {
      if (gridAction) {
        gridAction.kill();
        activeTimelines.delete(gridAction);
      }
      const positions = nodes.map((_, index) => index);
      for (let index = positions.length - 1; index > 0; index -= 1) {
        const other = Math.floor(Math.random() * (index + 1));
        [positions[index], positions[other]] = [positions[other], positions[index]];
      }
      const spread = 1;
      const rearrange = gsap.timeline({ defaults: { duration: 1.3, ease: "power2.inOut" } });
      nodes.forEach((cell, index) => {
        const destination = positions[index];
        const destinationRow = Math.floor(destination / 4);
        const destinationColumn = destination % 4;
        const offsetX = (destinationColumn - cell.columnIndex) * CELL_W * spread;
        const offsetY = (destinationRow - cell.rowIndex) * CELL_H * spread;
        rearrange.to(cell.layoutNode, { x: offsetX, y: offsetY }, index * 0.025);
        rearrange.to(cell.blockNode, {
          rotation: document.getElementById("animate-rotation").checked ? (Math.random() - 0.5) * 18 : 0,
          scale: document.getElementById("allow-overlap").checked ? 1.04 : 1,
          transformOrigin: "50% 50%",
        }, index * 0.025);
      });
      gridAction = rearrange;
      rearrange.timeScale(speedValues.overall * speedValues.block);
      runAction(rearrange);
    }

    function restoreLayout() {
      if (gridAction) {
        gridAction.kill();
        activeTimelines.delete(gridAction);
      }
      document.getElementById("grid-gap").value = "0";
      document.querySelector('[data-output="grid-gap"]').textContent = "0 px";
      const restore = gsap.timeline({ defaults: { duration: 0.8, ease: "power2.inOut" } });
      nodes.forEach((cell) => {
        restore.to(cell.layoutNode, { x: 0, y: 0 }, 0);
        restore.to(cell.blockNode, { rotation: 0, scale: 1 }, 0);
        restore.to(cell.tileNode, { opacity: 1 }, 0);
      });
      cells.forEach((cell, index) => {
        if (index % 4 === 0) restore.to(cell.row, { x: 0, duration: 0.65 }, 0);
      });
      gridAction = restore;
      restore.timeScale(speedValues.overall * speedValues.block);
      runAction(restore, () => {
        nodes.forEach((cell) => gsap.set(cell.layoutNode, { clearProps: "x,y,scale" }));
      });
    }

    document.getElementById("rearrange-grid").addEventListener("click", rearrangeGrid);
    document.getElementById("restore-layout").addEventListener("click", restoreLayout);
    document.getElementById("rotate-grid").addEventListener("click", () => {
      if (spinAction) {
        spinAction.kill();
        activeTimelines.delete(spinAction);
      }
      const rows = cells.filter((_, index) => index % 4 === 0).map((cell) => cell.row);
      spinAction = gsap.timeline();
      rows.forEach((row, index) => {
        spinAction.to(row, {
          rotation: rotationSign(index) * 2,
          transformOrigin: "50% 50%",
          duration: 0.55 / Math.max(0.25, speedValues.rotation),
          yoyo: true,
          repeat: 1,
        }, index * 0.08);
      });
      spinAction.timeScale(speedValues.overall * speedValues.rotation);
      runAction(spinAction, () => rows.forEach((row) => gsap.set(row, { rotation: 0 })));
      if (document.getElementById("animate-rotation").checked) startBlockRotation();
    });
    document.getElementById("rotate-columns").addEventListener("click", () => {
      if (spinAction) {
        spinAction.kill();
        activeTimelines.delete(spinAction);
      }
      spinAction = gsap.timeline();
      [0, 1, 2, 3].forEach((column, index) => {
        nodes.filter((cell) => cell.columnIndex === column).forEach((cell) => {
          spinAction.to(cell.blockNode, {
            rotation: rotationSign(index) * 2,
            transformOrigin: "50% 50%",
            duration: 0.55 / Math.max(0.25, speedValues.rotation),
            yoyo: true,
            repeat: 1,
          }, index * 0.08);
        });
      });
      spinAction.timeScale(speedValues.overall * speedValues.rotation);
      runAction(spinAction, () => nodes.forEach((cell) => gsap.set(cell.blockNode, { rotation: 0 })));
    });
    document.getElementById("merge-blocks-advanced").addEventListener("click", () => {
      document.getElementById("merge-blocks").click();
    });

    const presetSelect = document.getElementById("preset-select");
    presetSelect.addEventListener("change", () => {
      const preset = presetSelect.value;
      const configs = {
        original: { circle: 1, body: 1, block: 1, row: 1, rotation: false, gradient: "flat", colors: true },
        shifting: { circle: 0.6, body: 0.7, block: 1.4, row: 1.5, rotation: false, gradient: "flat", colors: false },
        floating: { circle: 1.65, body: 0.55, block: 0.4, row: 0.3, rotation: false, gradient: "flat", colors: false },
        rotating: { circle: 0.7, body: 0.8, block: 0.8, row: 0.7, rotation: true, gradient: "flat", colors: false },
        shuffle: { circle: 0.8, body: 0.8, block: 1, row: 1, rotation: false, gradient: "flat", colors: true },
        gradient: { circle: 0.8, body: 0.9, block: 0.7, row: 0.6, rotation: false, gradient: "bold", colors: true },
        merging: { circle: 0.8, body: 0.9, block: 0.85, row: 0.8, rotation: false, gradient: "subtle", colors: false },
        experimental: { circle: 1.8, body: 1.5, block: 1.7, row: 1.5, rotation: true, gradient: "radial", colors: true },
      };
      const config = configs[preset];
      [["circle-speed", config.circle], ["body-speed", config.body], ["block-speed", config.block], ["row-speed", config.row]]
        .forEach(([id, value]) => {
          const input = document.getElementById(id);
          input.value = String(value);
          input.dispatchEvent(new Event("input", { bubbles: true }));
        });
      document.getElementById("animate-rotation").checked = config.rotation;
      if (config.rotation) startBlockRotation();
      else if (rotationAction) {
        rotationAction.kill();
        rotationAction = null;
        nodes.forEach((cell) => gsap.set(cell.blockNode, { rotation: 0 }));
      }
      document.getElementById("gradient-mode").value = config.gradient;
      document.getElementById("gradient-mode").dispatchEvent(new Event("change", { bubbles: true }));
      document.getElementById("auto-colors").checked = config.colors;
      document.getElementById("auto-colors").dispatchEvent(new Event("change", { bubbles: true }));
      if (preset === "original") {
        restoreLayout();
        document.getElementById("restore-colors").click();
      }
      if (preset === "shifting" || preset === "experimental") rearrangeGrid();
      if (preset === "merging") document.getElementById("merge-blocks").click();
      if (preset === "shuffle") document.getElementById("color-swap").click();
    });

    document.getElementById("randomize-all").addEventListener("click", () => {
      rearrangeGrid();
      nodes.forEach((cell) => {
        cell.bgColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        cell.fgColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        cell.colorProxy.bgColor = cell.bgColor;
        cell.colorProxy.fgColor = cell.fgColor;
        renderCellColors(cell);
      });
      document.getElementById("animate-rotation").checked = true;
      startBlockRotation();
      populateColorFields();
    });

    document.getElementById("color-swap").addEventListener("click", () => {
      if (colorAction) {
        colorAction.kill();
        activeTimelines.delete(colorAction);
      }
      setActionsDisabled(true);
      paletteLoop.pause();
      colorAction = gsap.timeline();
      nodes.forEach((cell, index) => {
        const originalBg = cell.bgColor;
        const originalFg = cell.fgColor;
        const update = () => {
          cell.bgColor = normalizeHex(cell.colorProxy.bgColor);
          cell.fgColor = normalizeHex(cell.colorProxy.fgColor);
          renderCellColors(cell);
        };
        colorAction.to(cell.colorProxy, {
          bgColor: originalFg,
          fgColor: originalBg,
          duration: 0.8,
          onUpdate: update,
        }, index * 0.018);
        colorAction.to(cell.colorProxy, {
          bgColor: originalBg,
          fgColor: originalFg,
          duration: 0.8,
          onUpdate: update,
        }, 0.95 + index * 0.018);
      });
      colorAction.timeScale(speedValues.overall * speedValues.color);
      runAction(colorAction, () => {
        colorAction = null;
        setActionsDisabled(false);
        if (wantsPlay && !structuralAction && appState.autoColors) paletteLoop.resume();
      });
    });

    document.getElementById("grid-shift").addEventListener("click", () => {
      if (motionAction) {
        motionAction.kill();
        activeTimelines.delete(motionAction);
      }
      setActionsDisabled(true);
      structuralAction = true;
      Object.values(motionLoops).forEach((timeline) => timeline.pause());
      paletteLoop.pause();
      gradientLoop.pause();
      const shift = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      [0, 2, 4].forEach((rowIndex, index) => {
        shift.to(
          cells[rowIndex * 4].row,
          { x: index % 2 ? 16 : -16, duration: 0.72, yoyo: true, repeat: 1 },
          index * 0.11,
        );
      });
      nodes
        .filter((cell) => cell.columnIndex === 1 || cell.columnIndex === 3)
        .forEach((cell, index) => {
          shift.to(
            cell.layoutNode,
            { y: cell.columnIndex === 1 ? -12 : 12, duration: 0.7, yoyo: true, repeat: 1 },
            0.17 + (index % 5) * 0.06,
          );
        });
      motionAction = shift;
      shift.timeScale(speedValues.overall * speedValues.row);
      runAction(shift, () => {
          structuralAction = false;
          setActionsDisabled(false);
          setPlaying(wantsPlay);
        });
    });

    document.getElementById("merge-blocks").addEventListener("click", () => {
      if (mergeAction) {
        mergeAction.kill();
        activeTimelines.delete(mergeAction);
      }
      setActionsDisabled(true);
      structuralAction = true;
      Object.values(motionLoops).forEach((timeline) => timeline.pause());
      paletteLoop.pause();
      gradientLoop.pause();
      const panels = nodes.mergePanels;
      panels.forEach((panel) => {
        const first = nodes[panel.row * 4 + panel.column];
        const second = nodes[panel.row * 4 + panel.column + 1];
        panel.backgroundA.setAttribute("fill", first.bgColor);
        panel.backgroundB.setAttribute("fill", second.bgColor);
        panel.backgroundB.setAttribute("data-merge-fill", first.bgColor);
        panel.body.setAttribute(
          "fill",
          first.fgColor,
        );
        gsap.set(panel.group, { opacity: 0, scaleX: 0.88, transformOrigin: "50% 50%" });
        gsap.set([first.tileNode, second.tileNode], { opacity: 1 });
      });

      const merge = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      panels.forEach((panel, index) => {
        const first = nodes[panel.row * 4 + panel.column];
        const second = nodes[panel.row * 4 + panel.column + 1];
        const start = index * 0.16;
        merge.to(panel.group, { opacity: 1, scaleX: 1, duration: 0.55 }, start + 0.04);
        merge.to(
          panel.backgroundB,
          { attr: { fill: panel.backgroundB.getAttribute("data-merge-fill") }, duration: 0.55 },
          start + 0.04,
        );
        merge.to([first.tileNode, second.tileNode], { opacity: 0, duration: 0.25 }, start + 0.65);
        merge.to([first.tileNode, second.tileNode], { opacity: 1, duration: 0.25 }, start + 1.7);
        merge.to(panel.group, { opacity: 0, scaleX: 0.88, duration: 0.5 }, start + 1.95);
      });
      mergeAction = merge;
      merge.timeScale(speedValues.overall * speedValues.block);
      runAction(merge, () => {
        panels.forEach((panel) => gsap.set(panel.group, { opacity: 0, scaleX: 0.88 }));
        structuralAction = false;
        setActionsDisabled(false);
        setPlaying(wantsPlay);
      });
    });

    const resetButton = document.getElementById("reset");
    document.querySelectorAll("[data-reset-section]").forEach((button) => {
      button.addEventListener("click", () => {
        const section = button.dataset.resetSection;
        if (section === "shapes") document.getElementById("selected-cell").value = "all";
        const defaults = {
          playback: ["overall-speed", "speed"],
          grid: ["horizontal-range", "vertical-range", "block-speed", "grid-rotation", "grid-gap", "cell-size"],
          shapes: ["circle-speed", "circle-range", "circle-x-range", "circle-y-range", "body-speed", "body-range", "shape-size", "shape-rotation", "circle-size", "body-size", "circle-rotation", "body-rotation"],
          colors: ["color-speed", "gradient-speed", "gradient-angle", "gradient-intensity"],
          motion: ["row-speed", "rotation-speed", "zoom-speed"],
        };
        (defaults[section] || []).forEach((id) => {
          const input = document.getElementById(id);
          input.value = input.defaultValue;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        });
        const setCheckbox = (id, checked) => {
          const input = document.getElementById(id);
          input.checked = checked;
          input.dispatchEvent(new Event("change", { bubbles: true }));
        };
        if (section === "grid") {
          setCheckbox("animate-rows", true);
          setCheckbox("animate-columns", true);
          setCheckbox("animate-rotation", false);
          setCheckbox("allow-overlap", false);
          restoreLayout();
        } else if (section === "shapes") {
          setCheckbox("animate-circles", true);
          setCheckbox("animate-bodies", true);
          setCheckbox("morph-shapes", true);
        } else if (section === "colors") {
          document.getElementById("gradient-mode").value = "flat";
          document.getElementById("gradient-mode").dispatchEvent(new Event("change", { bubbles: true }));
          document.getElementById("auto-colors").checked = true;
          document.getElementById("auto-colors").dispatchEvent(new Event("change", { bubbles: true }));
          document.getElementById("restore-colors").click();
        } else if (section === "playback") {
          setCheckbox("loop-enabled", true);
          setPlaying(true);
        } else if (section === "motion") {
          setCheckbox("animate-rotation", false);
          document.getElementById("rotation-direction").value = "alternate";
          if (rotationAction) {
            rotationAction.kill();
            rotationAction = null;
            nodes.forEach((cell) => gsap.set(cell.blockNode, { rotation: 0 }));
          }
        }
      });
    });

    document.getElementById("master-reset").addEventListener("click", () => {
      resetButton.click();
      document.querySelectorAll(".control-section [type='range'], #speed").forEach((input) => {
        input.value = input.defaultValue;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
      document.getElementById("loop-enabled").checked = true;
      document.getElementById("animate-circles").checked = true;
      document.getElementById("animate-bodies").checked = true;
      document.getElementById("animate-rows").checked = true;
      document.getElementById("animate-columns").checked = true;
      document.getElementById("animate-rotation").checked = false;
      document.getElementById("allow-overlap").checked = false;
      document.getElementById("auto-colors").checked = true;
      document.getElementById("gradient-mode").value = "flat";
      document.getElementById("gradient-mode").dispatchEvent(new Event("change", { bubbles: true }));
      document.getElementById("selected-cell").value = "all";
      document.getElementById("preset-select").value = "original";
      document.getElementById("restore-colors").click();
      restoreLayout();
      setPlaying(true);
    });

    document.getElementById("reset").addEventListener("click", () => {
      activeTimelines.forEach((timeline) => timeline.kill());
      activeTimelines.clear();
      colorAction = motionAction = mergeAction = null;
      gridAction = spinAction = null;
      if (rotationAction) rotationAction.kill();
      rotationAction = null;
      structuralAction = false;
      setActionsDisabled(false);
      document.querySelectorAll(".control-section [type='range'], #speed").forEach((input) => {
        input.value = input.defaultValue;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
      [
        ["loop-enabled", true],
        ["animate-circles", true],
        ["animate-bodies", true],
        ["animate-rows", true],
        ["animate-columns", true],
        ["animate-rotation", false],
        ["allow-overlap", false],
        ["morph-shapes", true],
        ["auto-colors", true],
      ].forEach(([id, checked]) => {
        const input = document.getElementById(id);
        input.checked = checked;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
      document.getElementById("rotation-direction").value = "alternate";
      document.getElementById("gradient-mode").value = "flat";
      document.getElementById("gradient-mode").dispatchEvent(new Event("change", { bubbles: true }));
      document.getElementById("preset-select").value = "original";
      document.getElementById("selected-cell").value = "all";
      document.querySelector(".palette-copy").textContent = "A few familiar colors, up to new things.";
      populateColorFields();
      paletteLoop.pause(0);
      gradientLoop.pause(0);
      Object.values(motionLoops).forEach((timeline) => timeline.pause(0));
      if (rotationAction) rotationAction.kill();
      rotationAction = null;
      document.getElementById("gradient-intensity").value = "45";
      document.getElementById("gradient-angle").value = "35";
      document.getElementById("grid-gap").value = "0";
      document.getElementById("grid-rotation").value = "0";
      document.getElementById("shape-size").value = "100";
      document.getElementById("shape-rotation").value = "0";
      nodes.forEach((cell, index) => {
        cell.bgColor = cell.baseBg;
        cell.fgColor = cell.baseFg;
        cell.circleColor = cell.baseCircle;
        cell.colorProxy.bgColor = cell.baseBg;
        cell.colorProxy.fgColor = cell.baseFg;
        renderCellColors(cell);
      });
      gsap.set(poster, { clearProps: "transform" });
      nodes.forEach((cell) => {
        if (cell.bodyNode) {
          gsap.set(cell.bodyNode.parentNode, { clearProps: "transform" });
        }
        if (cell.headNodes.length) {
          gsap.set(cell.headNodes, { clearProps: "transform" });
          gsap.set(cell.headNodes.map((head) => head.querySelector("circle")), { clearProps: "transform" });
        }
        gsap.set(cell.tileNode, { clearProps: "opacity" });
        gsap.set(cell.layoutNode, { clearProps: "transform" });
        gsap.set(cell.blockNode, { clearProps: "transform" });
      });
      cells.forEach((cell, index) => {
        if (index % 4 === 0) {
          gsap.set(cell.row, { clearProps: "transform" });
        }
      });
      nodes.mergePanels.forEach((panel) => gsap.set(panel.group, { opacity: 0, scaleX: 0.88 }));
      document.getElementById("auto-colors").checked = true;
      appState.autoColors = true;
      setPlaying(true);
      Object.values(motionLoops).forEach((timeline) => timeline.play(0));
      gradientLoop.play(0);
      paletteLoop.play(0);
    });

    document.addEventListener("keydown", (event) => {
      if (event.code !== "Space" || event.repeat) return;
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement) return;
      event.preventDefault();
      setPlaying(!isPlaying());
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
  }

  if (!window.gsap) {
    motionMessage.hidden = false;
    document.getElementById("frame-state").textContent = "PAUSED";
    document.getElementById("play-toggle").disabled = true;
    return;
  }

  buildPoster();
  const motionLoops = buildMotionLoops();
  const paletteLoop = buildColorLoop();
  const gradientLoop = buildGradientLoop();
  setupControls(motionLoops, paletteLoop, gradientLoop);
})();
