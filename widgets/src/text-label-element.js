// Lit-based Web Component, bundled once at plugin-author/publish time (via
// esbuild — see package.json "build" script) into dist/text-label-element.bundle.js.
import { LitElement, html, css } from "lit";

class NexaTextLabel extends LitElement {
  static properties = {
    text: { type: String },
    color: { type: String },
    fontSize: { type: Number },
    fontFamily: { type: String },
    fontWeight: { type: String },
    fontStyle: { type: String },
    textAlign: { type: String },
    textDecoration: { type: String },
    lineHeight: { type: Number },
    letterSpacing: { type: Number },
    backgroundColor: { type: String },
    padding: { type: Number },
    wordWrap: { type: Boolean }
  };

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      overflow: hidden;
    }
    .label-inner {
      width: 100%;
      height: 100%;
      display: flex;
      box-sizing: border-box;
    }
  `;

  render() {
    const align = this.textAlign || "left";
    let justify = "flex-start";
    if (align === "center") justify = "center";
    else if (align === "right") justify = "flex-end";

    const style = [
      `color: ${this.color || "#333333"}`,
      `font-size: ${this.fontSize ? this.fontSize + "px" : "14px"}`,
      `font-family: ${this.fontFamily || "sans-serif"}`,
      `font-weight: ${this.fontWeight || "normal"}`,
      `font-style: ${this.fontStyle || "normal"}`,
      `text-align: ${align}`,
      `justify-content: ${justify}`,
      `align-items: center`,
      `text-decoration: ${this.textDecoration || "none"}`,
      `line-height: ${this.lineHeight || 1.2}`,
      `letter-spacing: ${this.letterSpacing ? this.letterSpacing + "px" : "normal"}`,
      `background-color: ${this.backgroundColor || "transparent"}`,
      `padding: ${this.padding ? this.padding + "px" : "0px"}`,
      `white-space: ${this.wordWrap ? "normal" : "nowrap"}`,
      `word-break: ${this.wordWrap ? "break-word" : "normal"}`,
      `overflow: hidden`,
      `text-overflow: ellipsis`
    ].join("; ");

    return html`<div class="label-inner" style="${style}">${this.text !== undefined ? this.text : "Text"}</div>`;
  }
}

if (!customElements.get("nexa-text-label")) {
  customElements.define("nexa-text-label", NexaTextLabel);
}
