// Lit-based Web Component, bundled once at plugin-author/publish time (via
// esbuild — see ../../build.js) into a single dependency-free file. That
// keeps the "no compile to deploy" promise: this compile step happens here,
// not when someone deploys a Nexa Dashboard page that uses this component.
import { LitElement, html, css } from "lit";

class NexaTextLabel extends LitElement {
  static properties = {
    text: { type: String },
    color: { type: String },
    fontSize: { type: Number }
  };

  static styles = css`
    :host { display: block; width: 100%; height: 100%; }
    div {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
      font-family: sans-serif;
    }
  `;

  render() {
    return html`<div style="color:${this.color}; font-size:${this.fontSize}px;">${this.text}</div>`;
  }
}

customElements.define("nexa-text-label", NexaTextLabel);
