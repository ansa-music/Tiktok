"use client";

import Script from "next/script";

/** Счётчик Яндекс Метрики. Подключается только если в админке задан ID. */
export function Metrika({ id }: { id: string }) {
  const numericId = Number(id.replace(/\D/g, ""));
  if (!numericId) return null;

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
          window.__ymId = ${numericId};
          ym(${numericId}, "init", { clickmap: true, trackLinks: true, accurateTrackBounce: true });
        `}
      </Script>
      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://mc.yandex.ru/watch/${numericId}`} style={{ position: "absolute", left: "-9999px" }} alt="" />
        </div>
      </noscript>
    </>
  );
}
