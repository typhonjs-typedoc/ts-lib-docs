function t(){}function e(t){return t()}function n(){return Object.create(null)}function r(t){t.forEach(e)}function i(t){return"function"==typeof t}function s(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}let o;function c(t,e){return t===e||(o||(o=document.createElement("a")),o.href=e,t===o.href)}new Set;const l="undefined"!=typeof window?window:"undefined"!=typeof globalThis?globalThis:global;class a{_listeners="WeakMap"in l?new WeakMap:void 0;_observer=void 0;options;constructor(t){this.options=t}observe(t,e){return this._listeners.set(t,e),this._getObserver().observe(t,this.options),()=>{this._listeners.delete(t),this._observer.unobserve(t)}}_getObserver(){return this._observer??(this._observer=new ResizeObserver((t=>{for(const e of t)a.entries.set(e.target,e),this._listeners.get(e.target)?.(e)})))}}a.entries="WeakMap"in l?new WeakMap:void 0;let u=!1;function d(t,e){t.appendChild(e)}function $(t){if(!t)return document;const e=t.getRootNode?t.getRootNode():t.ownerDocument;return e&&e.host?e:t.ownerDocument}function h(t,e){return d(t.head||t,e),e.sheet}function f(t,e,n){t.insertBefore(e,n||null)}function p(t){t.parentNode&&t.parentNode.removeChild(t)}function g(t){return document.createElement(t)}function m(t){return document.createTextNode(t)}function v(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}new Map;let b;function _(t){b=t}const y=[],w=[];let x=[];const k=[],M=Promise.resolve();let E=!1;function N(){E||(E=!0,M.then(S))}function O(t){x.push(t)}const A=new Set;let L=0;function S(){if(0!==L)return;const t=b;do{try{for(;L<y.length;){const t=y[L];L++,_(t),z(t.$$)}}catch(t){throw y.length=0,L=0,t}for(_(null),y.length=0,L=0;w.length;)w.pop()();for(let t=0;t<x.length;t+=1){const e=x[t];A.has(e)||(A.add(e),e())}x.length=0}while(y.length);for(;k.length;)k.pop()();E=!1,A.clear(),_(t)}function z(t){if(null!==t.fragment){t.update(),r(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(O)}}const j=new Set;function C(t,e){t&&t.i&&(j.delete(t),t.i(e))}function D(t){return void 0!==t?.length?t:Array.from(t)}new Set(["allowfullscreen","allowpaymentrequest","async","autofocus","autoplay","checked","controls","default","defer","disabled","formnovalidate","hidden","inert","ismap","loop","multiple","muted","nomodule","novalidate","open","playsinline","readonly","required","reversed","selected"]);let T;function B(t,e){const n=t.$$;null!==n.fragment&&(!function(t){const e=[],n=[];x.forEach((r=>-1===t.indexOf(r)?e.push(r):n.push(r))),n.forEach((t=>t())),x=e}(n.after_update),r(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function H(s,o,c,l,a,d,$=null,h=[-1]){const f=b;_(s);const g=s.$$={fragment:null,ctx:[],props:d,update:t,not_equal:a,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(o.context||(f?f.$$.context:[])),callbacks:n(),dirty:h,skip_bound:!1,root:o.target||f.$$.root};$&&$(g.root);let m=!1;if(g.ctx=c?c(s,o.props||{},((t,e,...n)=>{const r=n.length?n[0]:e;return g.ctx&&a(g.ctx[t],g.ctx[t]=r)&&(!g.skip_bound&&g.bound[t]&&g.bound[t](r),m&&function(t,e){-1===t.$$.dirty[0]&&(y.push(t),N(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}(s,t)),e})):[],g.update(),m=!0,r(g.before_update),g.fragment=!!l&&l(g.ctx),o.target){if(o.hydrate){u=!0;const t=function(t){return Array.from(t.childNodes)}(o.target);g.fragment&&g.fragment.l(t),t.forEach(p)}else g.fragment&&g.fragment.c();o.intro&&C(s.$$.fragment),function(t,n,s){const{fragment:o,after_update:c}=t.$$;o&&o.m(n,s),O((()=>{const n=t.$$.on_mount.map(e).filter(i);t.$$.on_destroy?t.$$.on_destroy.push(...n):r(n),t.$$.on_mount=[]})),c.forEach(O)}(s,o.target,o.anchor),u=!1,S()}_(f)}function P(t,e,n,r){const i=n[t]?.type;if(e="Boolean"===i&&"boolean"!=typeof e?null!=e:e,!r||!n[t])return e;if("toAttribute"===r)switch(i){case"Object":case"Array":return null==e?null:JSON.stringify(e);case"Boolean":return e?"":null;case"Number":return null==e?null:e;default:return e}else switch(i){case"Object":case"Array":return e&&JSON.parse(e);case"Boolean":default:return e;case"Number":return null!=e?+e:e}}"function"==typeof HTMLElement&&(T=class extends HTMLElement{$$ctor;$$s;$$c;$$cn=!1;$$d={};$$r=!1;$$p_d={};$$l={};$$l_u=new Map;constructor(t,e,n){super(),this.$$ctor=t,this.$$s=e,n&&this.attachShadow({mode:"open"})}addEventListener(t,e,n){if(this.$$l[t]=this.$$l[t]||[],this.$$l[t].push(e),this.$$c){const n=this.$$c.$on(t,e);this.$$l_u.set(e,n)}super.addEventListener(t,e,n)}removeEventListener(t,e,n){if(super.removeEventListener(t,e,n),this.$$c){const t=this.$$l_u.get(e);t&&(t(),this.$$l_u.delete(e))}}async connectedCallback(){if(this.$$cn=!0,!this.$$c){if(await Promise.resolve(),!this.$$cn||this.$$c)return;function t(t){return()=>{let e;return{c:function(){e=g("slot"),"default"!==t&&v(e,"name",t)},m:function(t,n){f(t,e,n)},d:function(t){t&&p(e)}}}}const e={},n=function(t){const e={};return t.childNodes.forEach((t=>{e[t.slot||"default"]=!0})),e}(this);for(const i of this.$$s)i in n&&(e[i]=[t(i)]);for(const s of this.attributes){const o=this.$$g_p(s.name);o in this.$$d||(this.$$d[o]=P(o,s.value,this.$$p_d,"toProp"))}for(const c in this.$$p_d)c in this.$$d||void 0===this[c]||(this.$$d[c]=this[c],delete this[c]);this.$$c=new this.$$ctor({target:this.shadowRoot||this,props:{...this.$$d,$$slots:e,$$scope:{ctx:[]}}});const r=()=>{this.$$r=!0;for(const t in this.$$p_d)if(this.$$d[t]=this.$$c.$$.ctx[this.$$c.$$.props[t]],this.$$p_d[t].reflect){const e=P(t,this.$$d[t],this.$$p_d,"toAttribute");null==e?this.removeAttribute(this.$$p_d[t].attribute||t):this.setAttribute(this.$$p_d[t].attribute||t,e)}this.$$r=!1};this.$$c.$$.after_update.push(r),r();for(const l in this.$$l)for(const a of this.$$l[l]){const u=this.$$c.$on(l,a);this.$$l_u.set(a,u)}this.$$l={}}}attributeChangedCallback(t,e,n){this.$$r||(t=this.$$g_p(t),this.$$d[t]=P(t,n,this.$$p_d,"toProp"),this.$$c?.$set({[t]:this.$$d[t]}))}disconnectedCallback(){this.$$cn=!1,Promise.resolve().then((()=>{!this.$$cn&&this.$$c&&(this.$$c.$destroy(),this.$$c=void 0)}))}$$g_p(t){return Object.keys(this.$$p_d).find((e=>this.$$p_d[e].attribute===t||!this.$$p_d[e].attribute&&e.toLowerCase()===t))||t}});class q{$$=void 0;$$set=void 0;$destroy(){B(this,1),this.$destroy=t}$on(e,n){if(!i(n))return t;const r=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return r.push(n),()=>{const t=r.indexOf(n);-1!==t&&r.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}"undefined"!=typeof window&&(window.__svelte||(window.__svelte={v:new Set})).v.add("4");var R="data:image/svg+xml,%3c%3fxml version='1.0' encoding='utf-8'%3f%3e%3csvg width='32px' height='32px' viewBox='0 0 32 32' version='1.1' xmlns='http://www.w3.org/2000/svg'%3e %3cpath fill='%23ddd' d='m0 0h32v32h-32z' /%3e %3cpath fill='rgb(52%2c 116%2c 240)' d='M 31.997993%2c0 V 32 H 0.00200602 V 0 Z M 25.141711%2c20 H 6.8582893 v 2 H 25.141711 Z M 11.493817%2c8.3263059 6.8377497%2c17.014207 H 9.4949689 L 12.414194%2c11.469306 15.258651%2c17 h 3.026776 L 13.378126%2c8.3340929 12.48047%2c8.3443059 Z M 21.142212%2c10 c -2.208862%2c0 -3.999498%2c1.567003 -3.999498%2c3.5 0%2c1.932997 1.790636%2c3.5 3.999498%2c3.5 0.613423%2c0 1.194591%2c-0.120851 1.714109%2c-0.336831 L 22.856283%2c17 h 2.285428 v -3.5 l -0.0059%2c-0.192035 C 25.021871%2c11.464278 23.277445%2c10 21.142212%2c10 Z m 0%2c2 c 0.946656%2c0 1.714071%2c0.671573 1.714071%2c1.5 0%2c0.828427 -0.767415%2c1.5 -1.714071%2c1.5 -0.946654%2c0 -1.71407%2c-0.671573 -1.71407%2c-1.5 0%2c-0.828427 0.767416%2c-1.5 1.71407%2c-1.5 z' /%3e%3c/svg%3e";function W(t){!function(t,e,n){const r=$(t);if(!r.getElementById(e)){const t=g("style");t.id=e,t.textContent=n,h(r,t)}}(t,"svelte-18ix693","a.svelte-18ix693:focus-visible{border-radius:0.25rem;outline:var(--dmt-outline-focus-visible)}.container.svelte-18ix693{display:flex;align-items:center;background:var(--dmt-container-background);border-radius:var(--dmt-container-border-radius);border:var(--dmt-container-border);gap:var(--mdn-link-button-gap);padding:var(--mdn-link-container-padding);width:fit-content;height:fit-content}img.svelte-18ix693{display:block;border-radius:var(--mdn-link-button-border-radius);border:var(--dmt-container-border);width:var(--mdn-link-button-diameter);height:var(--mdn-link-button-diameter);opacity:0.8}img.svelte-18ix693:hover{opacity:1}")}function Z(t,e,n){const r=t.slice();return r[2]=e[n],r}function J(t){let e,n=D(t[0]),r=[];for(let e=0;e<n.length;e+=1)r[e]=V(Z(t,n,e));return{c(){e=g("div");for(let t=0;t<r.length;t+=1)r[t].c();v(e,"class","container svelte-18ix693")},m(t,n){f(t,e,n);for(let t=0;t<r.length;t+=1)r[t]&&r[t].m(e,null)},p(t,i){if(1&i){let s;for(n=D(t[0]),s=0;s<n.length;s+=1){const o=Z(t,n,s);r[s]?r[s].p(o,i):(r[s]=V(o),r[s].c(),r[s].m(e,null))}for(;s<r.length;s+=1)r[s].d(1);r.length=n.length}},d(t){t&&p(e),function(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}(r,t)}}}function V(t){let e,n,r,i,s,o,l;return{c(){e=g("a"),n=g("img"),o=m(" "),v(n,"alt",r=t[2].title),c(n.src,i=t[2].svg)||v(n,"src",i),v(n,"title",s=t[2].title),v(n,"class","svelte-18ix693"),v(e,"href",l=t[2].url),v(e,"target","_blank"),v(e,"class","svelte-18ix693")},m(t,r){f(t,e,r),d(e,n),d(e,o)},p(t,o){1&o&&r!==(r=t[2].title)&&v(n,"alt",r),1&o&&!c(n.src,i=t[2].svg)&&v(n,"src",i),1&o&&s!==(s=t[2].title)&&v(n,"title",s),1&o&&l!==(l=t[2].url)&&v(e,"href",l)},d(t){t&&p(e)}}}function F(e){let n,r=e[0]?.length&&J(e);return{c(){r&&r.c(),n=m("")},m(t,e){r&&r.m(t,e),f(t,n,e)},p(t,[e]){t[0]?.length?r?r.p(t,e):(r=J(t),r.c(),r.m(n.parentNode,n)):r&&(r.d(1),r=null)},i:t,o:t,d(t){t&&p(n),r&&r.d(t)}}}function I(t,e,n){let{data:r}=e,i=[];return t.$$set=t=>{"data"in t&&n(1,r=t.data)},t.$$.update=()=>{if(2&t.$$.dirty&&r)try{const t=(e=r,JSON.parse(e.replace(/\\u003c/g,"<").replace(/\\u003e/g,">").replace(/\\u0026/g,"&").replace(/\\u0027/g,"'").replace(/\\u0022/g,'"'))),s=globalThis?.MDNLinks?.[t];if(s){const t=[];if("string"==typeof s.mdn_url&&t.push({svg:"data:image/svg+xml,%3c%3fxml version='1.0' encoding='utf-8'%3f%3e%3csvg width='32px' height='32px' viewBox='0 0 24 24' role='img' xmlns='http://www.w3.org/2000/svg'%3e %3cpath fill='%23ddd' d='m0 0h32v32h-32z' /%3e %3cpath fill='rgb(52%2c 116%2c 240)' d='M0 0v24h24V0zm10.564 4.969c.667-.047 1.001.066 1.59.242l.436.13.152.046.557.17c.365.099.748.105 1.115.017a2.033 2.033 0 011.48.174c.409.233.684.648.737 1.115.048.413.288.78.648.989.537.293 1.096.538 1.672.736.407.156.815.331 1.219.488.2.077.377.203.514.37a.87.87 0 01.197.49c.025.359.068.722.086 1.084h-.002c.028.5-.08.997-.317 1.439-.087.165-.183.321-.263.486a.616.616 0 01-.635.367.417.417 0 00-.277.09c-.246.161-.497.32-.75.471-.35.193-.77.216-1.141.06a5.36 5.36 0 00-1.908-.351 2.11 2.11 0 00-1.7.775 2.62 2.62 0 00-.38.77c-.223.55-.414 3.838-.414 4.676 0 0-3.161-.615-6.13-3.653l.774-2.03H5.4l1.754-1.856H4.14l1.752-1.858H3.029l3.188-3.383a7.349 7.349 0 013.549-1.95c.318-.055.576-.089.798-.104z'/%3e%3c/svg%3e",title:"MDN Documentation",url:s.mdn_url}),"string"==typeof s.ts_url&&t.push({svg:"data:image/svg+xml,%3c%3fxml version='1.0' encoding='utf-8'%3f%3e%3csvg width='32px' height='32px' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3e %3cpath fill='%23ddd' d='m0 0h32v32h-32z' /%3e %3cpath fill='rgb(52%2c 116%2c 240)' d='M0 16v16h32v-32h-32zM25.786 14.724c0.813 0.203 1.432 0.568 2.005 1.156 0.292 0.312 0.729 0.885 0.766 1.026 0.010 0.042-1.38 0.974-2.224 1.495-0.031 0.021-0.156-0.109-0.292-0.313-0.411-0.599-0.844-0.859-1.505-0.906-0.969-0.063-1.594 0.443-1.589 1.292-0.005 0.208 0.042 0.417 0.135 0.599 0.214 0.443 0.615 0.708 1.854 1.245 2.292 0.984 3.271 1.635 3.88 2.557 0.682 1.031 0.833 2.677 0.375 3.906-0.51 1.328-1.771 2.234-3.542 2.531-0.547 0.099-1.849 0.083-2.438-0.026-1.286-0.229-2.505-0.865-3.255-1.698-0.297-0.323-0.87-1.172-0.833-1.229 0.016-0.021 0.146-0.104 0.292-0.188s0.682-0.396 1.188-0.688l0.922-0.536 0.193 0.286c0.271 0.411 0.859 0.974 1.214 1.161 1.021 0.542 2.422 0.464 3.115-0.156 0.281-0.234 0.438-0.594 0.417-0.958 0-0.37-0.047-0.536-0.24-0.813-0.25-0.354-0.755-0.656-2.198-1.281-1.651-0.714-2.365-1.151-3.010-1.854-0.406-0.464-0.708-1.010-0.88-1.599-0.12-0.453-0.151-1.589-0.057-2.042 0.339-1.599 1.547-2.708 3.281-3.036 0.563-0.109 1.875-0.068 2.427 0.068zM18.276 16.063l0.010 1.307h-4.167v11.839h-2.948v-11.839h-4.161v-1.281c0-0.714 0.016-1.307 0.036-1.323 0.016-0.021 2.547-0.031 5.62-0.026l5.594 0.016z'/%3e%3c/svg%3e",title:"TS Documentation",url:s.ts_url}),"string"==typeof s.spec_url)t.push({svg:R,title:"Specification",url:s.spec_url});else if(Array.isArray(s.spec_url))for(const e of s.spec_url)t.push({svg:R,title:"Specification",url:e});n(0,i=t)}}catch(t){console.warn("[mdn-links] Failure to deserialize link data: ",r)}var e},[i,r]}if(customElements.define("wc-mdn-links",function(t,e,n,r,i,s){let o=class extends T{constructor(){super(t,n,i),this.$$p_d=e}static get observedAttributes(){return Object.keys(e).map((t=>(e[t].attribute||t).toLowerCase()))}};return Object.keys(e).forEach((t=>{Object.defineProperty(o.prototype,t,{get(){return this.$$c&&t in this.$$c?this.$$c[t]:this.$$d[t]},set(n){n=P(t,n,e),this.$$d[t]=n,this.$$c?.$set({[t]:n})}})})),r.forEach((t=>{Object.defineProperty(o.prototype,t,{get(){return this.$$c?.[t]}})})),s&&(o=s(o)),t.element=o,o}(class extends q{constructor(t){super(),H(this,t,I,F,s,{data:1},W)}get data(){return this.$$.ctx[1]}set data(t){this.$$set({data:t}),S()}},{data:{}},[],[],!0)),!globalThis.MDNLinks)try{const t=document.querySelector('meta[name="MDNLinks"]');globalThis.MDNLinks=globalThis?.dmtInflateAndUnpackB64?.(t.getAttribute("data-bcmp"))}catch(t){console.warn("[ts-lib-docs] Failed to inflate and unpack MDN links data.")}
//# sourceMappingURL=mdn-web-components.js.map