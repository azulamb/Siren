const Anime = ((getLists) => {
    return (svg) => {
        const list = new Array(...getLists(svg, '.sea1'), ...getLists(svg, '.sea2'), ...getLists(svg, '.sea3'), ...getLists(svg, '.sea4'));
        list.forEach((path) => {
            setTimeout(() => {
                path.classList.add('show');
            }, Math.random() * 500);
            setTimeout(() => {
                path.classList.remove('show');
            }, Math.random() * 500 + 1000);
        });
    };
})((svg, selector) => {
    const elements = svg.querySelectorAll(selector);
    const list = [];
    for (let i = 0; i < elements.length; ++i) {
        list.push(elements[i]);
    }
    return list;
});
function CreateLineText(text) { const line = new (customElements.get('line-text'))(); line.textContent = text; return line; }
function CreateHorizontalItem() { return new (customElements.get('horizontal-item'))(); }
function SelectArea(path, item) {
    const list = document.querySelectorAll('[ data-area="selected" ]');
    const selected = path.dataset.area === 'selected';
    for (let i = list.length - 1; 0 <= i; --i) {
        delete list[i].dataset.area;
    }
    if (selected) {
        history.replaceState(null, '', './');
        return;
    }
    path.dataset.area = 'selected';
    item.dataset.area = 'selected';
    setTimeout(() => {
        history.replaceState(null, '', `./?area=${path.id.replace(/[^0-9]/g, '')}`);
    }, 0);
}
window.addEventListener('DOMContentLoaded', (event) => {
    customElements.define('line-text', class extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.innerHTML =
                [
                    ':host { display: block; --color: black; --size: 1em; }',
                    ':host > div { position: relative; overflow: hidden; display: flex; align-items: center; min-height: 100%; width: 100%; height: 100%; }',
                    ':host > div > svg { max-width: 100%; display: block; }',
                    ':host > div > span { visibility: hidden; position: absolute; white-space: nowrap; font-size: var( --size ); }',
                ].join('');
            this.str = document.createElement('span');
            this.str.appendChild(document.createElement('slot'));
            this.text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            this.text.setAttribute('x', '0');
            this.text.setAttribute('y', '50%');
            this.text.setAttribute('dominant-baseline', 'middle');
            this.text.setAttribute('fill', 'var( --color )');
            this.text.setAttribute('font-size', 'var( --size )');
            this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.svg.setAttributeNS(null, 'preserveAspectRatio', 'none');
            this.svg.appendChild(this.text);
            const contents = document.createElement('div');
            contents.appendChild(this.str);
            contents.appendChild(this.svg);
            shadow.appendChild(style);
            shadow.appendChild(contents);
            const observer = new MutationObserver((records) => { this.update(); });
            observer.observe(this, { characterData: true, childList: true });
            this.update();
        }
        update() {
            this.text.textContent = this.textContent;
            const width = this.str.offsetWidth;
            const height = this.str.offsetHeight;
            this.svg.setAttributeNS(null, 'width', width + 'px');
            this.svg.setAttributeNS(null, 'height', height + 'px');
            this.svg.setAttributeNS(null, 'viewBox', '0 0 ' + width + ' ' + height);
        }
        static get observedAttributes() { return ['style']; }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (oldVal === newVal) {
                return;
            }
            this.update();
        }
    });
    customElements.define('horizontal-area', class extends HTMLElement {
        constructor() {
            super();
            this.scrollbar = (() => {
                const element = document.createElement('div');
                element.style.visibility = 'hidden';
                element.style.overflow = 'scroll';
                document.body.appendChild(element);
                const scrollbarWidth = element.offsetWidth - element.clientWidth;
                document.body.removeChild(element);
                return scrollbarWidth;
            })();
            const shadow = this.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.innerHTML =
                [
                    ':host { --item-width: ""; --default-direction: ltr; --reverse-direction: rtl; display: block; }',
                    ':host > div { width: 100%; height: 100%; overflow: hidden; }',
                    ':host > div > div { overflow-y: scroll; overflow-x: hidden; scroll-behavior: smooth; transform: translateX( -100% ) rotate( -90deg ); transform-origin: right top; }',
                    ':host( :not( [ noscrollbar ] ) ) > div > div { direction: var( --reverse-direction ); }',
                    '::slotted( * ) { direction: var( --default-direction ); }',
                    ':host( [ noscrollbar ] ) > div > div { -ms-overflow-style: none; scrollbar-width: none; }',
                    ':host( [ noscrollbar ] ) > div > div::-webkit-scrollbar { display:none; }',
                ].join('');
            this.wrapper = document.createElement('div');
            this.wrapper.appendChild(document.createElement('slot'));
            this.contents = document.createElement('div');
            this.contents.appendChild(this.wrapper);
            shadow.appendChild(style);
            shadow.appendChild(this.contents);
            const resizeObserver = new ResizeObserver(() => {
                this.update();
            });
            resizeObserver.observe(this.contents);
        }
        update() {
            this.wrapper.style.width = `${Math.ceil(this.contents.clientHeight)}px`;
            this.wrapper.style.height = `${Math.ceil(this.contents.clientWidth)}px`;
            const s = this.noscrollbar ? 0 : this.scrollbar;
            this.style.setProperty('--item-height', `${Math.ceil(this.contents.clientHeight - s)}px`);
        }
        static get observedAttributes() { return ['noscrollbar']; }
        attributeChangedCallback(name, oldValue, newValue) {
            if ((oldValue !== null) === (newValue !== null)) {
                return;
            }
            this.noscrollbar = newValue !== null;
        }
        get noscrollbar() { return this.hasAttribute('noscrollbar'); }
        set noscrollbar(value) {
            value ? this.setAttribute('noscrollbar', 'noscrollbar') : this.removeAttribute('noscrollbar');
            this.update();
        }
        searchTarget(target) {
            if (this.children.length < 1) {
                return null;
            }
            if (typeof target !== 'number') {
                let index = -1;
                for (let i = this.children.length - 1; 0 <= i; --i) {
                    if (this.children[i] === target) {
                        index = i;
                        break;
                    }
                }
                if (index < 0) {
                    return null;
                }
                return target;
            }
            if (target < 0) {
                return this.children[0];
            }
            if (this.children.length <= target) {
                return this.children[this.children.length - 1];
            }
            return this.children[target];
        }
        goTo(target) {
            const element = this.searchTarget(target);
            if (!element) {
                return;
            }
            for (let i = this.children.length - 1; 0 <= i; --i) {
                this.children[i].removeAttribute('selected');
            }
            element.setAttribute('selected', 'selected');
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
    customElements.define('horizontal-item', class extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.innerHTML =
                [
                    ':host { display: block; width: 100%; --width: var( --item-height ); height: var( --item-width ); overflow: hidden; }',
                    ':host > div { height: var( --width ); transform: rotate( 90deg ); }',
                ].join('');
            const contents = document.createElement('div');
            contents.appendChild(document.createElement('slot'));
            shadow.appendChild(style);
            shadow.appendChild(contents);
        }
    });
    customElements.define('modal-dialog', class extends HTMLElement {
        constructor() {
            super();
            this.bodyOverflow = '';
            const shadow = this.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.innerHTML =
                [
                    ':host { --dialog-back: #e3e4f1; --close-symbol: "×"; --close-back: var( --dialog-back ); --button-size: 2em; --offset-button: calc( var( --button-size ) * -0.5 ); --max-width: 100%; --max-height: 100%; --padding: 2em; z-index: 10000; background:rgba( 0, 0, 0, 0.8 ); position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; overflow: hidden; opacity: 1; box-sizing: border-box; padding: var( --padding ); display: block; }',
                    ':host( :not( [ show ] ) ) { opacity: 0; pointer-events: none; }',
                    ':host > div { display: grid; justify-content: center; align-items: center; grid-template-columns: 100%; grid-template-rows: 100%; width: 100%; height: 100%; }',
                    ':host > div > div { max-width: var( --max-width ); max-height: var( --max-height ); position: relative; }',
                    ':host > div > div > div { border-radius: 0.2em; background: var( --dialog-back ); max-height: calc( 100vh - var( --padding ) * 2 ); padding: 0.5em; box-sizing: border-box; overflow: auto; }',
                    ':host button { position: absolute; display: block; right: var( --offset-button ); top: var( --offset-button ); border-radius: 50%; width: var( --button-size ); height: var( --button-size ); border: 0; outline: 0; box-sizing: border-box; text-align: center; padding: 0; cursor: pointer; font-weight: bold; font-family: monospace; }',
                    ':host button::before { content:var( --close-symbol ); display: inline; }',
                    ':host( [ nobutton ] ) > div > button { display: none; }',
                ].join('');
            const dialogcontents = document.createElement('div');
            dialogcontents.appendChild(document.createElement('slot'));
            const close = document.createElement('button');
            const dialog = document.createElement('div');
            dialog.appendChild(dialogcontents);
            dialog.appendChild(close);
            const contents = document.createElement('div');
            contents.appendChild(dialog);
            shadow.appendChild(style);
            shadow.appendChild(contents);
            ((stopevent) => {
                this.addEventListener('wheel', stopevent);
                this.addEventListener('contextmenu', stopevent);
            })((event) => { event.stopPropagation(); event.preventDefault(); });
            ((stopevent) => {
                dialogcontents.addEventListener('wheel', stopevent);
                dialogcontents.addEventListener('contextmenu', stopevent);
                dialogcontents.addEventListener('click', stopevent);
            })((event) => { event.stopPropagation(); });
            ((onClose) => {
                this.addEventListener('click', onClose);
                close.addEventListener('click', onClose);
            })((event) => {
                event.stopPropagation();
                if (event.target === this && this.nobackclose) {
                    return;
                }
                if (this.onclose && !this.onclose()) {
                    return;
                }
                this.close();
            });
            this.bodyOverflow = document.body.style.overflowY;
            if (this.hasAttribute('show')) {
                this.show();
            }
        }
        get nobackclose() { return this.hasAttribute('nobackclose'); }
        set nobackclose(value) {
            value ? this.setAttribute('nobackclose', 'nobackclose') : this.removeAttribute('nobackclose');
        }
        get noclosebutton() { return this.hasAttribute('noclosebutton'); }
        set noclosebutton(value) {
            value ? this.setAttribute('noclosebutton', 'noclosebutton') : this.removeAttribute('nobackclose');
        }
        show() {
            this.setAttribute('show', '');
            this.bodyOverflow = document.body.style.overflowY;
            document.body.style.overflowY = 'hidden';
            return this;
        }
        close() {
            this.removeAttribute('show');
            document.body.style.overflowY = this.bodyOverflow;
            return this;
        }
    });
    customElements.define('five-star', class extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.innerHTML =
                [
                    ':host { display: block; --size: 1rem; pointer-events: none;  }',
                    ':host > div { width: var( --size ); height: var( --size ); transform: translate(-50%, -50%); }',
                    ':host > div > svg { display: block; width: 100%; height: 100%; }',
                    ':host > div > svg > path { fill: transparent; }',
                    ':host > div > svg > path.b { fill: #222235; stroke: #222235; }',
                    ':host > div > svg > path.f { stroke: black; }',
                    ':host > div > svg > path.l { fill: #fddf34; }',
                ].join('');
            const back = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            back.classList.add('b');
            back.setAttributeNS(null, 'd', 'm15 1.8 4.6554 6.7926 7.8987 2.3284-5.0217 6.5265 0.2264 8.2317-7.7589-2.759-7.7589 2.759 0.2264-8.2317-5.0217-6.5265 7.8987-2.3284z');
            back.setAttributeNS(null, 'stroke-linecap', 'round');
            back.setAttributeNS(null, 'stroke-linejoin', 'round');
            back.setAttributeNS(null, 'stroke-width', '3');
            this.piece = [];
            for (let i = 0; i < 5; ++i) {
                this.piece.push(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
                this.piece[i].classList.add(`p${i}`);
            }
            this.piece[0].setAttributeNS(null, 'd', 'M 15,15 10.3446,8.5926 15,1.8 19.6554,8.5926 Z');
            this.piece[1].setAttributeNS(null, 'd', 'm15 15 4.6554-6.4074 7.8987 2.3284-5.0217 6.5265z');
            this.piece[2].setAttributeNS(null, 'd', 'm15 15 7.5324 2.4474 0.2264 8.2317-7.7589-2.759z');
            this.piece[3].setAttributeNS(null, 'd', 'm15 15v7.92l-7.7589 2.759 0.2264-8.2317z');
            this.piece[4].setAttributeNS(null, 'd', 'm15 15-7.5324 2.4474-5.0217-6.5265 7.8987-2.3284z');
            const front = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            front.classList.add('f');
            front.setAttributeNS(null, 'd', back.getAttribute('d'));
            front.setAttributeNS(null, 'stroke-linecap', 'round');
            front.setAttributeNS(null, 'stroke-linejoin', 'round');
            front.setAttributeNS(null, 'stroke-width', '3');
            this.star = (() => {
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttributeNS(null, 'width', '30');
                svg.setAttributeNS(null, 'height', '30');
                svg.setAttributeNS(null, 'viewBox', '0 0 30 30');
                svg.appendChild(back);
                svg.appendChild(this.piece[0]);
                svg.appendChild(this.piece[1]);
                svg.appendChild(this.piece[2]);
                svg.appendChild(this.piece[3]);
                svg.appendChild(this.piece[4]);
                svg.appendChild(front);
                return svg;
            })();
            const contents = document.createElement('div');
            contents.appendChild(this.star);
            shadow.appendChild(style);
            shadow.appendChild(contents);
            if (this.hasAttribute('light')) {
                this.light(0);
                this.light(1);
                this.light(2);
                this.light(3);
                this.light(4);
            }
        }
        get svg() {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttributeNS(null, 'width', '30');
            svg.setAttributeNS(null, 'height', '30');
            svg.setAttributeNS(null, 'viewBox', '0 0 30 30');
            svg.innerHTML = this.star.innerHTML;
            for (let i = this.star.children.length - 1; 0 <= i; --i) {
                const p = this.star.children[i];
                if (p.tagName !== 'path') {
                    continue;
                }
                const style = getComputedStyle(p, '');
                const fill = style.getPropertyValue('fill');
                if (fill) {
                    svg.children[i].style.fill = fill;
                }
                const stroke = style.getPropertyValue('stroke');
                if (stroke) {
                    svg.children[i].style.stroke = stroke;
                }
            }
            return svg;
        }
        light(piece) {
            const p = this.piece[piece];
            if (!p) {
                return;
            }
            p.classList.add('l');
        }
        unlight(piece) {
            const p = this.piece[piece];
            if (!p) {
                return;
            }
            p.classList.remove('l');
        }
    });
    customElements.define('mission-item', class extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.innerHTML =
                [
                    ':host { --front-color: var( --front ); --hilight: var( --front2 ); display: block; width: 100%; height: 1rem; line-height: 1rem; font-size: 0.8rem; }',
                    ':host > div { width: 100%; height: 100%; display: grid; grid-template-columns: 1fr 3em 2.5em 1em; grid-template-rows: 1fr; padding-left: 0.5em; position: relative; box-sizing: border-box; background: linear-gradient(90deg, #1c1c38, #32505f); }',
                    ':host > div::before { content: ""; display: block; position: absolute; left: 0; top: 0; bottom: 0; width: 0.2em; height: 80%; margin: auto; background: var( --hilight ); }',
                    ':host input { color: var( --front-color ); border: 0; outline: 0; background: transparent; text-align: right; font-size: 1em; direction: rtl; }',
                    ':host line-text { width: 100%; height: 100%; --color: var( --front-color ); }',
                    ':host( [ disable ] ) { pointer-events: none; opacity: 0.5; }',
                    ':host( [ max="0" ] ) > div { background: #32505f; }',
                    ':host div > svg { display: block; width: 100%; height: 100%; }',
                    ':host div > svg > path { fill: #222235; stroke: rgba( 65, 70, 93, 0.6 ); }',
                    ':host div.complete > svg > path { fill: #fddf34; stroke: rgba( 125, 79, 0, 0.6 ); }',
                ].join('');
            this.mission = CreateLineText(this.title);
            this.current = document.createElement('input');
            this.current.type = 'number';
            this.current.min = '0';
            this.current.max = '1';
            if (this.hasAttribute('max')) {
                const max = parseInt(this.getAttribute('max')) || 0;
                if (1 < max) {
                    this.current.max = max + '';
                }
            }
            this.current.value = '0';
            if (this.hasAttribute('value')) {
                const value = parseInt(this.getAttribute('value')) || 0;
                if (0 < value && value <= parseInt(this.current.max)) {
                    this.current.value = value + '';
                }
            }
            this.current.addEventListener('change', (event) => {
                this.setAttribute('value', this.current.value + '');
                this.onUpdate();
            });
            this.total = document.createElement('div');
            this.total.textContent = '/' + this.current.max;
            this.star = document.createElement('div');
            this.star.appendChild((() => {
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttributeNS(null, 'd', 'm500 60 155.18 226.42 263.29 77.613-167.39 217.55 7.5466 274.39-258.63-91.967-258.63 91.967 7.5466-274.39-167.39-217.55 263.29-77.613z');
                path.setAttributeNS(null, 'stroke-linecap', 'round');
                path.setAttributeNS(null, 'stroke-linejoin', 'round');
                path.setAttributeNS(null, 'stroke-width', '100');
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttributeNS(null, 'width', '1000');
                svg.setAttributeNS(null, 'height', '1000');
                svg.setAttributeNS(null, 'viewBox', '0 0 1000 1000');
                svg.appendChild(path);
                return svg;
            })());
            const contents = document.createElement('div');
            contents.appendChild(this.mission);
            contents.appendChild(this.current);
            contents.appendChild(this.total);
            contents.appendChild(this.star);
            shadow.appendChild(style);
            shadow.appendChild(contents);
        }
        static get observedAttributes() { return ['title', 'max', 'value']; }
        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue === newValue) {
                return;
            }
            if (name === 'title') {
                this.title = newValue || '';
                return;
            }
            const value = parseInt(newValue);
            if (name === 'value') {
                if (this.value === value) {
                    return;
                }
                if (value < 0) {
                    this.value = 0;
                }
                else if (this.max < value) {
                    this.value = this.max;
                }
                this.value = value;
            }
            else if (name === 'max') {
                if (this.max === value || value < 1) {
                    return;
                }
                this.max = value;
                if (value < this.value) {
                    this.value = value;
                }
            }
        }
        get title() { return this.getAttribute('title') || ''; }
        set title(value) {
            const setValue = value || '';
            this.setAttribute('title', setValue);
            this.mission.textContent = setValue;
        }
        get max() { return parseInt(this.current.max); }
        set max(value) {
            if (typeof (value) !== 'number' || value < 0) {
                return;
            }
            const strValue = Math.floor(value) + '';
            this.current.max = strValue;
            this.total.textContent = '/' + strValue;
            this.setAttribute('max', strValue);
        }
        get value() { return parseInt(this.current.value); }
        set value(value) {
            if (typeof (value) !== 'number') {
                return;
            }
            const strValue = Math.floor(value) + '';
            this.current.value = strValue;
            this.setAttribute('value', strValue);
            this.onUpdate();
        }
        get complete() { return 0 < this.max && this.max <= this.value; }
        onUpdate() {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            this.timer = setTimeout(() => {
                this.star.classList[this.complete ? 'add' : 'remove']('complete');
                this.dispatchEvent(new CustomEvent('change', { detail: { value: this.value, max: this.max } }));
                this.timer = 0;
            }, 50);
        }
    });
    customElements.define('area-info', class extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.innerHTML =
                [
                    ':host { --front-color: var( --front ); --back-selected: var( --back2 ) display: block; width: var(--item-width); height: 100%; --header-height: 1.5rem; --selected-back: transparent; }',
                    ':host-context( [ data-area="selected" ] ) { --selected-back: var( --back-selected ); }',
                    ':host > div { color: var( --front-color ); overflow: hidden; width: 100%; height: 100%; display: grid; grid-template-columns: 1fr; grid-template-rows: var( --header-height ) 1fr; box-sizing: border-box; padding: 0 0.1rem; background: var( --selected-back ); }',
                    ':host > div > h3 { display: grid; grid-template-columns: 1.5rem 1fr; margin: 0; width: 100%; height: 100%; font-size: 1em; line-height: var( --header-height ); background: linear-gradient(90deg, #0c719c, #79b2ce); cursor: pointer; }',
                    ':host > div > h3 > line-text { --color: var( --front-color ); display: inline; }',
                    ':host > div > h3 > line-text:first-child { opacity: 0.5; }',
                    ':host > div > h3 > line-text:last-child { --size: 0.8em; }',
                    ':host > div > div > mission-item { margin-top: 0.3em; }',
                    ':host input{ color: var( --front-color ); }',
                ].join('');
            this.noArea = CreateLineText('0');
            this.titleText = CreateLineText('');
            const title = document.createElement('h3');
            title.appendChild(this.noArea);
            title.appendChild(this.titleText);
            title.addEventListener('click', () => { if (this.onselectd) {
                this.onselectd();
            } });
            this.missions = document.createElement('div');
            const contents = document.createElement('div');
            contents.appendChild(title);
            contents.appendChild(this.missions);
            shadow.appendChild(style);
            shadow.appendChild(contents);
        }
        get no() { return parseInt(this.noArea.textContent || '') || 0; }
        set no(value) {
            this.noArea.textContent = value + '';
        }
        get title() { return this.titleText.textContent || ''; }
        set title(value) {
            this.titleText.textContent = value;
        }
        addMission(mission) {
            this.missions.appendChild(mission);
        }
        get complete() {
            let complete = 0;
            const items = this.missions.querySelectorAll('mission-item');
            for (let item of items) {
                if (item.complete) {
                    ++complete;
                }
            }
            return complete;
        }
    });
    customElements.define('toggle-button', class extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.innerHTML =
                [
                    ':host { --height: 1.5rem; --border: calc( var( --height ) / 10 ); --back: #8a8a8a; --front: #8a8a8a; --unchecked: #eaeaea; --checked: #66ff95; --cursor: pointer; --duration: 0.2s; --timing-function: ease-in-out; --delay: 0s; display: inline-block; width: calc( var( --height ) * 1.6 ); }',
                    ':host > div { --radius: calc( var( --height ) / 2 ); width: 100%; height: var( --height ); position: relative; box-sizing: border-box; }',
                    ':host > div > div { background: var( --back ); width: 100%; height: 100%; position: absolute; top: 0; left: 0; border-radius: var( --radius ); display: flex; justify-content: center; align-items: center; cursor: var( --cursor ); }',
                    ':host > div > div::before { content: ""; display: block; background: var( --unchecked ); width: calc( 100% - var( --border ) * 2 ); height: calc( 100% - var( --border ) * 2 ); border-radius: calc( var( --radius ) * 0.8 ); transition: background var( --duration ) var( --timing-function ) var( --delay ); }',
                    ':host > div > div::after { content: ""; display: block; width: var( --height ); height: var( --height ); border-radius: 50%; background: var( --front ); position: absolute; left: 0; transition: left var( --duration ) var( --timing-function ) var( --delay ); }',
                    ':host( [ checked ] ) > div > div::before { background: var( --checked ); }',
                    ':host( [ checked ] ) > div > div::after { left: calc( 100% - var( --height ) ); }',
                ].join('');
            const button = document.createElement('div');
            button.addEventListener('click', () => { this.toggle(); });
            const contents = document.createElement('div');
            contents.appendChild(button);
            shadow.appendChild(style);
            shadow.appendChild(contents);
        }
        toggle() {
            this.checked = !this.checked;
            return this;
        }
        get checked() { return this.hasAttribute('checked'); }
        set checked(value) {
            const changed = !value === this.checked;
            if (!changed) {
                return;
            }
            value ? this.setAttribute('checked', 'checked') : this.removeAttribute('checked');
            this.dispatchEvent(new CustomEvent('change'));
        }
        static get observedAttributes() { return ['checked']; }
        attributeChangedCallback(name, oldValue, newValue) {
            this.checked = newValue !== null;
        }
    });
    customElements.define('tweet-button', class extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.innerHTML =
                [
                    ':host { --padding: 0rem; --color: #1da1f2; display: block; box-sizing: border-box; overflow: hidden; width: 1rem; height: 1rem; position: absolute; top: 0.1rem; right: 0.1rem; }',
                    ':host( :hover ) { --color: #1a91da; }',
                    ':host( [ disable ] ) > a { user-select: none; pointer: cursor; }',
                    ':host > a { display: flex; justify-content: center; align-items: center; box-sizing: border-box; text-decoration: none; color: inherit; width: 100%; height: 100%; padding: var( --padding ); }',
                    'svg{ width: auto; height: 1rem; }',
                ].join('');
            this.link = document.createElement('a');
            if (this.hasAttribute('target')) {
                this.link.target = this.getAttribute('target') || '';
            }
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttributeNS(null, 'd', 'M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z');
            path.style.fill = 'var( --color )';
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttributeNS(null, 'width', '24px');
            svg.setAttributeNS(null, 'height', '24px');
            svg.setAttributeNS(null, 'viewBox', '0 0 24 24');
            svg.appendChild(path);
            this.link.appendChild(svg);
            this.link.target = '_blank';
            this.link.rel = 'noopener noreferrer';
            this.update();
            shadow.appendChild(style);
            shadow.appendChild(this.link);
        }
        update() {
            const params = new URLSearchParams();
            if (this.text) {
                params.append('text', this.text);
            }
            if (this.url) {
                params.append('url', this.url);
            }
            const hashtags = this.hashtags();
            if (0 < hashtags.length) {
                params.append('hashtags', hashtags.join(','));
            }
            if (this.via) {
                params.append('via', this.via);
            }
            if (this.in_reply_to) {
                params.append('in_reply_to', this.in_reply_to);
            }
            const related = this.related();
            if (0 < related.length) {
                params.append('related', related.join(','));
            }
            if (this.lang) {
                params.append('lang', this.lang);
            }
            const url = new URL('https://twitter.com/intent/tweet');
            url.search = params.toString();
            this.link.href = url.toString();
        }
        twitterArray(data) {
            return data.split(',').filter((v) => { return !!v; });
        }
        get text() { return this.getAttribute('text') || ''; }
        set text(value) { this.setAttribute('text', value || ''); this.update(); }
        get url() { return this.getAttribute('url') || ''; }
        set url(value) { this.setAttribute('url', value || ''); this.update(); }
        hashtags(...values) {
            if (values.length === 0) {
                return this.twitterArray(this.getAttribute('hashtags') || '');
            }
            this.setAttribute('hashtags', values.join(','));
            this.update();
        }
        get via() { return this.getAttribute('via') || ''; }
        set via(value) { this.setAttribute('via', (value || '').replace(/^\@+/, '')); this.update(); }
        get in_reply_to() { return this.getAttribute('in_reply_to') || ''; }
        set in_reply_to(value) {
            try {
                this.setAttribute('in_reply_to', new URL(value).pathname.replace(/^.+\/([0-9]+)$/, '$1'));
            }
            catch (error) {
                this.setAttribute('in_reply_to', (value || '').replace(/[^0-9]+/g, ''));
            }
            this.update();
        }
        related(user1, user2) {
            if (user1 === undefined) {
                return this.twitterArray(this.getAttribute('related') || '');
            }
            const users = [];
            if (user1) {
                users.push(user1.replace(/^\@+/, ''));
            }
            if (user2) {
                users.push(user2.replace(/^\@+/, ''));
            }
            this.setAttribute('related', users.join(','));
            this.update();
        }
        static get observedAttributes() { return ['lang']; }
        attributeChangedCallback(attrName, oldVal, newVal) {
            if (oldVal === newVal) {
                return;
            }
            this.update();
        }
    });
});
class URLData {
    constructor() {
        this.table = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    }
    static parse() {
        const data = new URLData();
        return data.decode();
    }
    toNum(num) {
        return num.split('').reverse().reduce((total, now, index) => {
            return total + this.table.indexOf(now) * Math.pow(this.table.length, index);
        }, 0);
    }
    toStr(num) {
        const list = [];
        while (0 < num) {
            list.unshift(this.table[num % this.table.length]);
            num = Math.floor(num / this.table.length);
        }
        if (list.length <= 0) {
            list.push(this.table[0]);
        }
        return list.join('');
    }
    decode(p) {
        const q = ((params) => {
            return params.get('q') || '';
        })(new URLSearchParams(p || location.search));
        const params = {};
        if (!q || q.match(/[^\_\.0-9a-zA-Z]/)) {
            return params;
        }
        q.split('_').forEach((area) => {
            const data = area.split('.');
            const key = data.shift();
            if (!key) {
                return;
            }
            params[`sa${this.toNum(key)}`] = { m: data.map((i) => { return this.toNum(i); }) };
        });
        return params;
    }
    encode(userdata) {
        const data = userdata.export();
        return Object.keys(data).map((key) => {
            const area = data[key];
            return Object.assign({ id: parseInt(key.replace(/[^0-9]/g, '')) }, area);
        }).filter((data) => {
            return data.m[0] + data.m[1] + data.m[2] + data.m[3] + data.m[4];
        }).map((data) => {
            const list = [...data.m];
            for (let i = 4; 0 <= i; --i) {
                if (list[i]) {
                    break;
                }
                list.pop();
            }
            return `${this.toStr(data.id)}.${list.map((i) => { return this.toStr(i); }).join('.')}`;
        }).join('_');
    }
}
class UserData {
    constructor() {
        this.lock = false;
        this.data =
            {};
    }
    _get(key) {
        if (this.lock) {
            return '';
        }
        return localStorage.getItem(key) || '';
    }
    getMission(id, mission) {
        if (!this.data[`sa${id}`]) {
            return 0;
        }
        return this.data[`sa${id}`].m[mission] || 0;
    }
    async _set(key, value) {
        if (this.lock) {
            return;
        }
        localStorage.setItem(key, value);
    }
    setMission(id, mission, value) {
        if (!this.data[`sa${id}`] || typeof this.data[`sa${id}`].m[mission] !== 'number') {
            return;
        }
        this.data[`sa${id}`].m[mission] = value;
        return this._set(`sa${id}_m${mission}`, value + '');
    }
    async load() {
        Object.keys(SEA_AREA).map((key) => { return SEA_AREA[key]; }).forEach((info) => {
            const id = `sa${info.no}`;
            if (!this.data[id]) {
                this.data[id] = { m: [0, 0, 0, 0, 0] };
            }
            for (let i = 0; i < UserData.MISSION; ++i) {
                this.data[id].m[i] = parseInt(this._get(`${id}_m${i}`)) || 0;
            }
        });
    }
    async save() {
        Object.keys(SEA_AREA).forEach(async (key) => {
            if (!this.data[key]) {
                return;
            }
            const id = parseInt(key.replace(/[^0-9]/g, '')) || 0;
            for (let i = 0; i < UserData.MISSION; ++i) {
                await this.setMission(id, i, this.data[id].m[i]);
            }
        });
    }
    async clear() {
        if (this.lock) {
            return;
        }
        localStorage.clear();
    }
    import(data, lock = false) {
        this.lock = true;
        Object.keys(this.data).forEach((key) => {
            this.data[key] = { m: [] };
            for (let i = 0; i < UserData.MISSION; ++i) {
                this.data[key].m[i] = (data[key] ? data[key].m[i] : 0) || 0;
            }
        });
    }
    export() { return JSON.parse(JSON.stringify(this.data)); }
    toURL() {
        const url = new URL(location.href.split('?')[0]);
        const data = new URLData().encode(this);
        if (data) {
            url.searchParams.set('q', data);
        }
        return url.toString();
    }
}
UserData.MISSION = 5;
class MyDate {
    constructor() {
        this.date = new Date();
    }
    format() {
        const num2fillstr = (n) => { return (n + '').padStart(2, '0'); };
        return [
            this.date.getFullYear(),
            num2fillstr(this.date.getMonth() + 1),
            num2fillstr(this.date.getDate()),
            num2fillstr(this.date.getHours()),
            num2fillstr(this.date.getMinutes()),
            num2fillstr(this.date.getSeconds()),
        ];
    }
    formatNoSymbol() { return this.format().join(''); }
    formatDate() {
        const d = this.format();
        return `${d[0]}/${d[1]}/${d[2]} ${d[3]}:${d[4]}:${d[5]}`;
    }
}
function Screenshot(date, complete, max) {
    const offsetStarSize = 30 / 2;
    const stars = document.getElementById('stars').querySelectorAll('five-star');
    const img = document.createElement('img');
    const svg = ((map) => {
        const parent = document.createElement('div');
        parent.innerHTML = map.outerHTML;
        for (let i = 1; i <= 4; ++i) {
            const seas = parent.querySelectorAll('.sea' + i);
            for (let sea of seas) {
                sea.parentElement.removeChild(sea);
            }
        }
        return parent.children[0];
    })(document.getElementById('siren'));
    for (let s of stars) {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.innerHTML = s.svg.innerHTML;
        g.setAttributeNS(null, 'style', `transform:translate(calc(${s.style.left} - ${offsetStarSize}px),calc(${s.style.top} - ${offsetStarSize}px))`);
        svg.appendChild(g);
    }
    ((s) => {
        if (!s) {
            return;
        }
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.innerHTML = s.svg.innerHTML;
        g.setAttributeNS(null, 'style', `transform:translate(860px,665px)`);
        svg.appendChild(g);
    })(document.querySelector('five-star[ light ]'));
    [
        `${(complete + '').padStart(3, '0')}/${max}`,
        `${date.formatDate()}`,
    ].forEach((str, index) => {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttributeNS(null, 'x', `${980 - index * 140}`);
        text.setAttributeNS(null, 'y', '687');
        text.setAttributeNS(null, 'font-size', '20');
        text.setAttributeNS(null, 'text-anchor', 'end');
        text.setAttributeNS(null, 'fill', '#dcdcdc');
        text.textContent = str;
        svg.appendChild(text);
    });
    return new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        const svgimg = encodeURIComponent(svg.outerHTML.replace(/[\r\n]/g, '').replace(/\s{2,}/g, ''));
        img.src = `data:image/svg+xml,${svgimg}`;
    }).then(() => { return img; });
}
class Drop extends EventTarget {
    constructor() {
        super();
        this.init(document.body);
    }
    init(target) {
        target.addEventListener('dragover', (event) => {
            event.stopPropagation();
            event.preventDefault();
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'copy';
            }
        });
        target.addEventListener('drop', (event) => {
            event.stopPropagation();
            event.preventDefault();
            const dataTransfer = event.dataTransfer;
            if (!dataTransfer) {
                return;
            }
            const files = dataTransfer.files;
            if (files.length < 1) {
                return;
            }
            const file = files[0];
            this.onDrop(file);
        });
    }
    onDrop(file) {
        this.dispatchEvent(new CustomEvent('dropfile', { detail: { file: file } }));
    }
}
class CSV {
    constructor(header) {
        this.header = Array.isArray(header) ? header.map((data) => { return `"${data}"`; }).join(',') : header.replace(/\,+$/, '');
        this.lines = [];
    }
    add(data) {
        this.lines.push(typeof (data) === 'string' ? data : data.map((data) => {
            return typeof data === 'number' ? data : `"${data}"`;
        }).join(','));
        return this;
    }
    toString() {
        return this.header + ',\n' + this.lines.join(',\n');
    }
    toDataURL() {
        return `data:text/csv;charset=UTF-8,${encodeURIComponent(this.toString())}`;
    }
    downloadLink(filename) {
        const link = document.createElement('a');
        link.setAttribute('download', `${filename}.csv`);
        link.setAttribute('href', this.toDataURL());
        return link;
    }
    parseLine(line) {
        return line.split(',').map((data) => {
            const value = data.replace(/^\"(.*)\"$/, '$1');
            if (!value) {
                return '';
            }
            if (!value.match(/[^0-9]/)) {
                return parseInt(value);
            }
            const float = parseFloat(value);
            if (isFinite(float)) {
                return float;
            }
            return value;
        });
    }
    get max() { return this.lines.length; }
    read(line) {
        return this.lines[line] || '';
    }
    load(line) {
        return this.parseLine(this.read(line));
    }
    parse() {
        const header = this.header.split(',').map((data) => { return data.replace(/^\"(.*)\"$/, '$1'); });
        return this.lines.map((line) => {
            const data = {};
            this.parseLine(line).forEach((value, index) => {
                const key = header[index];
                if (!key) {
                    return key;
                }
                data[key] = value;
            });
            return data;
        });
    }
    static async load(file) {
        return new Promise((resolve, reject) => {
            if (!file.name.match(/\.csv$/)) {
                return reject(new Error('Not CSV.'));
            }
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onabort = reject;
            reader.onload = (event) => { resolve(reader.result); };
            reader.readAsText(file);
        }).then((buf) => {
            const lines = buf.split(/\r\n|\r|\n/);
            const csv = new CSV(lines.shift() || '');
            lines.forEach((line) => { csv.add(line); });
            return csv;
        });
    }
}
const user = new UserData();
Promise.all([
    user.load(),
    customElements.whenDefined('line-text'),
    customElements.whenDefined('horizontal-area'),
    customElements.whenDefined('horizontal-item'),
    customElements.whenDefined('modal-dialog'),
    customElements.whenDefined('five-star'),
    customElements.whenDefined('mission-item'),
    customElements.whenDefined('area-info'),
    customElements.whenDefined('toggle-button'),
    customElements.whenDefined('tweet-button'),
]).then(() => {
    return new Promise((resolve) => { setTimeout(resolve, 50); });
}).then(() => {
    let importData = () => { };
    const importUserData = (file) => {
        const tbody = document.getElementById('diff');
        tbody.innerHTML = '';
        CSV.load(file).then((csv) => {
            const data = JSON.parse(JSON.stringify(SEA_AREA));
            Object.keys(data).forEach((key) => {
                data[key].missions = data[key].missions.map((mission) => {
                    return Object.assign({ now: 0 }, mission);
                });
            });
            const newData = csv.parse().filter((user) => { return !!data[`sa${user.no}`]; }).map((user) => {
                const area = data[`sa${user.no}`];
                for (let i = 0; i < UserData.MISSION; ++i) {
                    const value = user[`missions_${i + 1}`];
                    if (!value || typeof (value) !== 'number' || value <= 0) {
                        continue;
                    }
                    area.missions[i].now = Math.min(Math.floor(value), area.missions[i].max);
                }
                return {
                    no: user.no,
                    missions: area.missions.map((data) => { return data.now; }),
                };
            });
            const list = Object.keys(data).map((key) => { return data[key]; });
            list.sort((a, b) => { return a.no - b.no; });
            tbody.innerHTML = '';
            list.forEach((data) => {
                const no = document.createElement('td');
                no.textContent = data.no + '';
                const area = document.createElement('td');
                area.textContent = data.title;
                const tr = document.createElement('tr');
                tr.appendChild(no);
                tr.appendChild(area);
                data.missions.forEach((mission, index) => {
                    const now = document.createElement('td');
                    now.textContent = user.getMission(data.no, index) + '';
                    const connect = document.createElement('td');
                    connect.classList.add('connect');
                    const value = document.createElement('td');
                    value.textContent = mission.now + '';
                    tr.appendChild(now);
                    tr.appendChild(connect);
                    tr.appendChild(value);
                });
                tbody.appendChild(tr);
            });
            importData = () => {
                newData.forEach((data) => {
                    for (let i = 0; i < data.missions.length; ++i) {
                        user.setMission(data.no, i, data.missions[i]);
                    }
                });
                location.reload();
            };
            modal.dataset.type = 'import';
            modal.show();
        }).catch((error) => { console.error(error); });
    };
    ((data) => {
        if (Object.keys(data).length <= 0) {
            return;
        }
        user.import(data);
        document.body.classList.add('readonly');
    })(URLData.parse());
    document.getElementById('importcsv').addEventListener('change', (event) => {
        const files = event.target.files;
        if (!files || !files[0]) {
            return;
        }
        importUserData(files[0]);
    });
    const modal = ((modal) => {
        ['info', 'config'].forEach((button) => {
            document.getElementById(button).addEventListener('click', () => {
                modal.dataset.type = button;
                modal.show();
            });
        });
        document.getElementById('import').addEventListener('click', () => { importData(); });
        const drop = new Drop();
        drop.addEventListener('dropfile', (event) => {
            importData = () => { };
            importUserData(event.detail.file);
        });
        return modal;
    })(document.getElementById('modal'));
    document.getElementById('ss').addEventListener('click', () => {
        const date = new MyDate();
        const complete = CountComplete();
        Screenshot(date, complete, Object.keys(SEA_AREA).length * 5).then((img) => {
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 560;
            const context = canvas.getContext('2d');
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
            const link = document.createElement('a');
            link.download = `siren_${date.formatNoSymbol()}.png`;
            link.href = canvas.toDataURL();
            link.click();
        }).catch((error) => { console.error(error); });
    });
    document.getElementById('totalstar').textContent = (Object.keys(SEA_AREA).length * 5) + '';
    const CountComplete = () => {
        return ((items) => {
            let complete = 0;
            for (let item of items) {
                complete += item.complete;
            }
            return complete;
        })(document.body.querySelectorAll('area-info'));
    };
    const UpdateComplete = ((target, tweet) => {
        let timer = 0;
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(() => {
                target.textContent = (CountComplete() + '').padStart(3, '0');
                tweet.url = user.toURL();
                timer = 0;
            }, 500);
        };
    })(document.getElementById('getstar'), document.getElementById('tweet'));
    ((funcs) => {
        document.querySelectorAll('.configitem').forEach((item) => {
            const button = item.children[0];
            if (button.tagName !== 'BUTTON' || !item.id || !funcs[item.id]) {
                return;
            }
            button.addEventListener('click', funcs[item.id]);
        });
    })({
        downloaduser: () => {
            const date = new MyDate();
            const csv = new CSV([
                'no',
                'missions_1',
                'max_1',
                'missions_2',
                'max_2',
                'missions_3',
                'max_3',
                'missions_4',
                'max_4',
                'missions_5',
                'max_5',
            ]);
            const list = Object.keys(SEA_AREA).map((key) => {
                return SEA_AREA[key];
            });
            list.sort((a, b) => { return a.no - b.no; });
            list.forEach((data) => {
                const no = data.no;
                csv.add([
                    no,
                    user.getMission(no, 0),
                    data.missions[0].max,
                    user.getMission(no, 1),
                    data.missions[1].max,
                    user.getMission(no, 2),
                    data.missions[2].max,
                    user.getMission(no, 3),
                    data.missions[3].max,
                    user.getMission(no, 4),
                    data.missions[4].max,
                ]);
            });
            csv.downloadLink(`siren_user_${date.formatNoSymbol()}`).click();
        },
        deluserdata: () => {
            if (!confirm('データはこのブラウザにしかありません。本当にデータを削除しますか？')) {
                return;
            }
            user.clear();
            location.reload();
        },
        downloadmap: () => {
            const csv = new CSV([
                'no',
                'title',
                'lv',
                'missions_1',
                'max_1',
                'missions_2',
                'max_2',
                'missions_3',
                'max_3',
                'missions_4',
                'max_4',
                'missions_5',
                'max_5',
            ]);
            const list = Object.keys(SEA_AREA).map((key) => {
                return SEA_AREA[key];
            });
            list.sort((a, b) => { return a.no - b.no; });
            list.forEach((data) => {
                csv.add([
                    data.no,
                    data.title,
                    data.lv,
                    MISSIONS[data.missions[0].no],
                    data.missions[0].max,
                    MISSIONS[data.missions[1].no],
                    data.missions[1].max,
                    MISSIONS[data.missions[2].no],
                    data.missions[2].max,
                    MISSIONS[data.missions[3].no],
                    data.missions[3].max,
                    MISSIONS[data.missions[4].no],
                    data.missions[4].max,
                ]);
            });
            csv.downloadLink('siren_area').click();
        },
    });
    document.getElementById('loading').classList.add('hide');
    const urlParams = ((params) => {
        const data = { area: 0 };
        const area = parseInt(params.get('area') || '') || 0;
        if (area && 0 < area) {
            data.area = area;
        }
        return data;
    })(new URLSearchParams(location.search));
    const svg = document.getElementById('siren');
    const stars = document.getElementById('stars');
    const parentRect = svg.getBoundingClientRect();
    setTimeout(() => { Anime(svg); }, 1000);
    const list = document.getElementById('list');
    const areas = Object.keys(SEA_AREA).map((key) => { return SEA_AREA[key]; });
    areas.sort((a, b) => { return a.no - b.no; });
    areas.forEach((info) => {
        const areaId = info.no;
        const path = document.getElementById(`sa${areaId}`);
        const star = new (customElements.get('five-star'))();
        if (path) {
            path.dataset.lv = info.lv + '';
            setTimeout(() => { path.classList.add('show'); }, 3500);
            const r = path.getBoundingClientRect();
            if (path.dataset.y) {
                const y = parseFloat(path.dataset.y) || 0;
                star.style.top = `${Math.floor((r.top - parentRect.top + (r.bottom - r.top) * y) / parentRect.height * 1000) / 10}%`;
            }
            else {
                star.style.top = `${Math.floor((r.top - parentRect.top + (r.bottom - r.top) / 2) / parentRect.height * 1000) / 10}%`;
            }
            if (path.dataset.x) {
                const x = parseFloat(path.dataset.x) || 0;
                star.style.left = `${Math.floor((r.left - parentRect.left + (r.right - r.left) * x) / parentRect.width * 1000) / 10}%`;
            }
            else {
                star.style.left = `${Math.floor((r.left - parentRect.left + (r.right - r.left) / 2) / parentRect.width * 1000) / 10}%`;
            }
            stars.appendChild(star);
            path.classList.add('f', ...info.missions.filter((item) => { return 0 < item.no; }).map((item) => { return `m${item.no}`; }));
        }
        const createMission = () => { return new (customElements.get('mission-item'))(); };
        const areaInfo = new (customElements.get('area-info'))();
        areaInfo.no = areaId;
        areaInfo.title = info.title;
        info.missions.forEach((info, index) => {
            const mission = createMission();
            mission.addEventListener('change', (event) => {
                user.setMission(areaId, index, event.detail.value);
                star[mission.complete ? 'light' : 'unlight'](index);
                UpdateComplete();
            });
            mission.title = MISSIONS[info.no] || '???';
            mission.max = info.max;
            mission.value = user.getMission(areaId, index);
            areaInfo.addMission(mission);
        });
        const item = CreateHorizontalItem();
        item.appendChild(areaInfo);
        list.appendChild(item);
        const back = document.getElementById(`sb${info.no}`);
        if (!back) {
            return;
        }
        const selected = () => {
            SelectArea(back, item);
            list.goTo(item);
        };
        back.addEventListener('click', selected);
        areaInfo.onselectd = selected;
        if (areaId === urlParams.area) {
            setTimeout(selected, 4000);
        }
    });
    document.getElementById('showstar').addEventListener('change', (event) => {
        const checked = event.target.checked;
        stars.classList[checked ? 'remove' : 'add']('hidestar');
    });
    ((select, svg) => {
        ((list) => {
            list.shift();
            const first = list.shift();
            list.sort();
            list.unshift(first);
            list.forEach((mission) => {
                const index = MISSIONS.indexOf(mission);
                const option = document.createElement('option');
                option.value = index + '';
                option.textContent = mission;
                select.appendChild(option);
            });
        })([...MISSIONS]);
        select.addEventListener('change', (event) => {
            const value = parseInt(select.options[select.selectedIndex].value);
            if (value <= 1) {
                delete svg.dataset.mission;
            }
            else {
                svg.dataset.mission = value + '';
            }
        });
    })(document.getElementById('missions'), document.getElementById('siren'));
});
