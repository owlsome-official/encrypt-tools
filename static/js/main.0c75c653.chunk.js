(this["webpackJsonpencrypt-tools"]=this["webpackJsonpencrypt-tools"]||[]).push([[0],{33:function(e,t,n){},34:function(e,t,n){},41:function(e,t){},66:function(e,t,n){"use strict";n.r(t);var c=n(0),r=n.n(c),a=n(27),l=n.n(a),o=n(14),s=n(3),d=(n(33),n(11)),i=(n(34),n(1));var u=function(e){var t=e.name;return Object(i.jsx)("span",{className:"text-3xl text-center block font-bold pb-3 px-4",children:t})},b="encrypt",p="decrypt";function h(e){var t=e.children;return Object(i.jsx)("nav",{className:"px-8 py-6",children:Object(i.jsx)("ul",{className:"flex space-x-2 items-center",children:t})})}function j(e){var t=e.href,n=e.isActive,c=e.children;return Object(i.jsx)("li",{children:Object(i.jsx)(o.b,{to:t,className:"shadow-sm block px-4 py-2 rounded-2xl ".concat(n?"bg-pink-default text-white-default":"border border-solid border-pink-default text-pink-default hover:bg-pink-light hover:border-pink-light hover:text-white-default"),children:c})})}var x=[{href:"/encrypt",name:"Encrypt",mode:b},{href:"/decrypt",name:"Decrypt",mode:p}];var f=function(e){var t=e.mode;return Object(i.jsxs)(h,{children:[Object(i.jsx)("span",{className:"text-xl block font-bold",children:"Mode:"}),x.map((function(e){return Object(i.jsx)(j,{href:e.href,isActive:t===e.mode,children:e.name},e.mode)}))]})};var m=function(e){var t=e.children,n=e.grid,c=void 0===n?"":n,r=c?"grid-cols-"+c:"";return Object(i.jsx)("div",{className:"px-8 py-4",children:Object(i.jsx)("div",{className:"grid gap-4 ".concat(r),children:t})})};var v=function(e){var t=e.name,n=e.label,c=e.value,r=e.onChange,a=e.placeholder,l=e.span,o=void 0===l?"":l,s="col-span-".concat(o||"1");return Object(i.jsxs)("div",{className:"".concat(s," pb-4"),children:[Object(i.jsx)("label",{htmlFor:t,className:"text-xl block font-bold pb-2",children:n}),Object(i.jsx)("input",{name:t,value:c,onChange:r,placeholder:a,className:"shadow-xl appearance-none bg-white-dark border border-white-dark rounded-2xl w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"})]})};var O=function(e){var t=e.name,n=e.label,c=e.value,r=e.onChange,a=e.placeholder,l=e.span,o=void 0===l?"":l,s="col-span-".concat(o||"1");return Object(i.jsxs)("div",{className:"".concat(s," pb-4"),children:[Object(i.jsx)("label",{htmlFor:t,className:"text-xl block font-bold pb-2",children:n}),Object(i.jsx)("textarea",{rows:5,name:t,value:c,onChange:r,placeholder:a,className:"shadow-xl appearance-none border border-white-default rounded-3xl w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"})]})},g=Object(i.jsx)("svg",{className:"svg-icon w-4 mx-1",viewBox:"0 0 20 20",children:Object(i.jsx)("path",{fill:"currentColor",d:"M17.391,2.406H7.266c-0.232,0-0.422,0.19-0.422,0.422v3.797H3.047c-0.232,0-0.422,0.19-0.422,0.422v10.125c0,0.232,0.19,0.422,0.422,0.422h10.125c0.231,0,0.422-0.189,0.422-0.422v-3.797h3.797c0.232,0,0.422-0.19,0.422-0.422V2.828C17.812,2.596,17.623,2.406,17.391,2.406 M12.749,16.75h-9.28V7.469h3.375v5.484c0,0.231,0.19,0.422,0.422,0.422h5.483V16.75zM16.969,12.531H7.688V3.25h9.281V12.531z"})});var y=function(e){var t=e.result,n=Object(c.useState)("Copy"),r=Object(d.a)(n,2),a=r[0],l=r[1];return Object(i.jsxs)("div",{className:"px-8 py-4",children:[Object(i.jsxs)("label",{htmlFor:"result",className:"text-xl font-bold pb-2 flex justify-between",children:[Object(i.jsx)("span",{className:"",children:"Result:"}),Object(i.jsxs)("button",{type:"button",className:"flex justify-center items-center shadow-sm rounded-2xl border border-solid border-pink-default text-pink-default hover:bg-pink-default hover:text-white-default text-sm px-2 py-1",onClick:function(e){var n=document.createElement("textarea");n.innerText=t,document.body.appendChild(n),n.select(),document.execCommand("copy"),n.remove(),e.target.focus(),l("Copied"),setTimeout((function(){l("Copy")}),3e3)},children:[g,a]})]}),Object(i.jsx)("pre",{name:"result",className:"w-full shadow-xl rounded-2xl inline-block border-0 bg-white-dark px-2 py-2 whitespace-pre-wrap break-words overflow-x-auto max-h-48",children:t||"\n"})]})},w=n(40),k=function(e,t,n){try{var c={iv:w.enc.Utf8.parse(n),mode:w.mode.CBC,padding:w.pad.Pkcs7};return w.AES.encrypt(e,w.enc.Utf8.parse(t),c).toString()}catch(r){return""}},C="67890123456789012345678901234567",N="6789012345678901",E='{"firstname":"Chinnawat","lastname":"Chimdee"}',S=k(C,N,E);var F=Object(s.h)((function(e){var t=e.history,n=Object(c.useState)(C),r=Object(d.a)(n,2),a=r[0],l=r[1],o=Object(c.useState)(N),h=Object(d.a)(o,2),j=h[0],x=h[1],g=Object(c.useState)(E),F=Object(d.a)(g,2),V=F[0],A=F[1],I=Object(c.useState)(S),B=Object(d.a)(I,2),M=B[0],T=B[1],U=Object(s.g)().mode;Object(c.useEffect)((function(){U!==b&&U!==p&&t.push("/encrypt")}),[U,t]),Object(c.useEffect)((function(){T(P(U,V,a,j))}),[U,V,a,j]);var P=function(e,t,n,c){return e===b?k(t,n,c):e===p?function(e,t,n){try{var c={iv:w.enc.Utf8.parse(n),mode:w.mode.CBC,padding:w.pad.Pkcs7};return w.AES.decrypt(e,w.enc.Utf8.parse(t),c).toString(w.enc.Utf8)}catch(r){return""}}(t,n,c):""};return Object(i.jsx)("div",{className:"App h-screen w-full flex justify-center items-center bg-black",children:Object(i.jsxs)("div",{className:"divide-y divide-gray-300 w-100 max-w-prose bg-white-default py-4 rounded-2xl",children:[Object(i.jsx)(u,{name:"AES Encrypt & Decrypt Tools"}),Object(i.jsx)(f,{mode:U}),Object(i.jsxs)(m,{grid:"2",children:[Object(i.jsx)(v,{name:"key",label:"Key:",value:a,onChange:function(e){return l(e.target.value)},placeholder:"Enter Key"}),Object(i.jsx)(v,{name:"iv",label:"IV:",value:j,onChange:function(e){return x(e.target.value)},placeholder:"Enter IV"}),Object(i.jsx)(O,{span:"2",name:"input",label:"Input:",value:V,onChange:function(e){return A(e.target.value)},placeholder:"Enter Input"})]}),Object(i.jsx)(y,{result:M})]})})})),V=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,67)).then((function(t){var n=t.getCLS,c=t.getFID,r=t.getFCP,a=t.getLCP,l=t.getTTFB;n(e),c(e),r(e),a(e),l(e)}))};l.a.render(Object(i.jsx)(o.a,{basename:"/encrypt-tools",children:Object(i.jsx)(r.a.StrictMode,{children:Object(i.jsxs)(s.d,{children:[Object(i.jsx)(s.b,{path:"/",exact:!0,children:Object(i.jsx)(s.a,{to:"/encrypt"})}),Object(i.jsx)(s.b,{path:"/:mode",children:Object(i.jsx)(F,{})})]})})}),document.getElementById("root")),V()}},[[66,1,2]]]);
//# sourceMappingURL=main.0c75c653.chunk.js.map