"use strict";
(function () {
	const plainNum = /^\d+$/;
	const fontWeights = {
		extrablack: 950,
		black: 900,
		extrabold: 800,
		bold: 700,
		semibold: 600,
		medium: 500,
		normal: 400,
		semilight: 350,
		light: 300,
		extralight: 200,
		thin: 100
	};
	const textBlock = document.createElement("p");
	var sizeUnit = "vmin";

	window.addEventListener("DOMContentLoaded", function() {
		document.body.append(textBlock);
		doRefit();
		window.addEventListener("resize", doRefit, { passive: true });
		window.addEventListener("hashchange", function () { configureBlock(); }, { passive: true });
	}, { once: true, passive: true });

	configureBlock();

	function getAlign(align) {
		switch (String(align).toLowerCase().trim()) {
			case "-":
			case "\u2212":
			case "start":
			case "top":
			case "left":
				return -1;
			case "+":
			case "end":
			case "bottom":
			case "right":
				return +1;
			default:
				return 0;
		}
	}

	function configureBlock(params = new URLSearchParams(location.hash.replace("#", ""))) {
		if (typeof params === "object" && params !== null) {
			if (params instanceof URLSearchParams) {
			} else if (params instanceof URL || params instanceof Location) {
				params = new URLSearchParams(params.hash.replace("#", ""));
			} else if (params instanceof String) {
				params = String(params);
			}
		} else if (typeof params === "string") {
			params = new URLSearchParams(params);
		}

		var v;
		var align = {
			inline: undefined,
			block: undefined
		};
		var weight = "normal"; // "normal" | "bold" | number
		var italic = false; // boolean
		textBlock.id = "text-block";

		if (v = params.get("text")) {
			textBlock.textContent = v;
			document.title = v.slice(0, 32);
		} else {
			textBlock.contentEditable = "plaintext-only";
			textBlock.textContent = "Click to edit.";
		}

		if (params.has("weight")) {
			params.delete("bold");
			if (plainNum.test(params.get("weight"))) {
				weight = Number(params.get("weight"));
			} else {
				weight = fontWeights[(params.get("weight") || "").toLowerCase().trim().replaceAll("-", "")] || "normal";
			}
		} else if (params.has("bold")) {
			weight = "bold";
		}
		weight == "normal" || textBlock.style.setProperty("font-weight", weight);

		if (params.has("italic")) {
			italic = true;
			textBlock.style.setProperty("font-style", "italic");
			params.get("italic") && textBlock.style.setProperty("font-style", "oblique " + params.get("italic"));
		}

		if (textBlock.isConnected) {
			for (let e of document.head.querySelectorAll("link.remote-font")) {
				e.remove();
			}
		}

		if (v = params.get("font")) {
			let fontLink = document.createElement("link");
			fontLink.classList.add("remote-font");
			fontLink.setAttribute("rel", "stylesheet");
			let fontEndpoint = "https://fonts.GoogleAPIs.com/css?display=swap&family=" + encodeURIComponent(v);
			if (weight == "bold") {
				if (italic) {
					fontEndpoint += ":bi";
				} else {
					fontEndpoint += ":b";
				}
			} else if (weight != "normal") {
				if (italic) {
					fontEndpoint += ":i" + weight;
				} else {
					fontEndpoint += ":" + weight;
				}
			} else if (italic) {
				fontEndpoint += ":i";
			}
			fontLink.setAttribute("href", fontEndpoint);
			document.head.append(fontLink);
			textBlock.style.setProperty("font-family", '"' + v.replaceAll('"', "\\000022") + '"');
		}

		if (v = (params.get("align") || "").toLowerCase().trim().replaceAll("\u2212", "-")) {
			switch (v) {
				case "--":
					align.block = -1;
					align.inline = -1;
					break;
				case "+-":
					align.block = +1;
					align.inline = -1;
					break;
				case "-+":
					align.block = -1;
					align.inline = +1;
					break;
				case "":
				case "++":
					align.block = +1;
					align.inline = +1;
					break;
				default:
					if ((/\s/).test(v)) {
						v = v.split(/\s+/, 2);
						align.block = getAlign(v[0]);
						align.inline = getAlign(v[1]);
					} else {
						align.block = align.inline = getAlign(v);
					}
			}
		} else {
			align.block = 0;
			align.inline = 0;
		}

		textBlock.style.setProperty("text-align", align.inline == 0 ? "center" : align.inline > 0 ? "end" : "start");
	}

	function doRefit() {
		console.clear();
		if (!textBlock.isConnected) { return; }
		textBlock.style.setProperty("overflow", "scroll");
		try {
			return refit();
		} finally {
			textBlock.style.removeProperty("overflow");
		}
	}

	function refit(min = 1, max = 100) {
		if (false) {
			let str = new Array(100);
			str.fill(" ");
			str[min - 1] = "<";
			str[max - 1] = ">";
			console.log(str.join(""));
		}
		if (max <= min || ((max - min) < 1)) {
			textBlock.style.setProperty("font-size", min + sizeUnit);
			console.log(min);
			return min;
		}
		let mid = (max + min) / 2;
		textBlock.style.setProperty("font-size", mid + sizeUnit);
		console.log(`${min.toFixed(4)}\t\u2013\t${max.toFixed(4)}`);
		if (fits()) {
			return refit(mid, max);
		} else {
			return refit(min, mid);
		}
	}

	function fits() {
		return textBlock.scrollHeight <= textBlock.clientHeight && textBlock.scrollWidth <= textBlock.clientWidth;
	}
})();
