"use strict";var __awaiter=this&&this.__awaiter||function(e,a,u,s){return new(u=u||Promise)(function(n,t){function i(e){try{r(s.next(e))}catch(e){t(e)}}function o(e){try{r(s.throw(e))}catch(e){t(e)}}function r(e){var t;e.done?n(e.value):((t=e.value)instanceof u?t:new u(function(e){e(t)})).then(i,o)}r((s=s.apply(e,a||[])).next())})};function serialize(i,u){let s=[],a=void 0,c=void 0,l=()=>{},d=void 0,v=void 0,f=void 0;const t=(null==u?void 0:u.concurrency)||1;let h=0,n=void 0;function p(){__awaiter(this,void 0,void 0,function*(){var e;h>=t||(e=0===h,h+=1,yield n=e&&null!=u&&u.delay?new Promise(e=>setTimeout(e,u.delay)):n,function n(){return __awaiter(this,void 0,void 0,function*(){if(null!=u&&u.sortBy){const o=u.sortBy.key,r=u.sortBy.direction||"asc";s=s.sort((e,t)=>{const n=("asc"===r?e:t).input[o],i=("asc"===r?t:e).input[o];return"number"==typeof n&&"number"==typeof i?n-i:"string"==typeof n&&"string"==typeof i?n.localeCompare(i):0})}const t=s.shift();if(t){null!=u&&u.inputTransformer&&(t.input=yield u.inputTransformer(t.input,a));try{const e=yield i(t.input);t.resolve({data:e}),a=e}catch(e){t.resolve({message:e})}}s.length?yield n():--h})}())})}return function(r,a){return __awaiter(this,void 0,void 0,function*(){return yield new Promise(e=>{if(null!=a&&a.startNewBatch&&(c&&clearTimeout(c),l()),null!=u&&u.batch){const{debounceInterval:n,batchTransformer:i,maxDebounceInterval:o}=u.batch;d=d||(new Date).valueOf();var t=o?Math.max((new Date).valueOf()-d,0):0,t=o?Math.max(o-t,0):1/0,t=Math.min(n,t);c&&clearTimeout(c),v=i(v,r),f&&f({message:"batched"}),f=e,l=()=>{s.push({resolve:e,input:v||r}),v=void 0,f=void 0,d=void 0,l=()=>{},p()},c=setTimeout(l,t)}else s.push({resolve:e,input:r}),p()})})}}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=serialize;