
(function () {
  "use strict";

  const GTM_ID = "GTM-WH7QTDWH";
  const CONSENT_KEY = "jp_cookie_consent_v1";
  const CONSENT_DURATION = 180 * 24 * 60 * 60 * 1000;

  const denied = {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  };

  // Establish denied consent before Google Tag Manager is loaded.
  window.dataLayer = window.dataLayer || [];

  window.gtag = function () {
    window.dataLayer.push(arguments);
  };

  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500
  });

  function loadGTM() {
    if (window.jpGtmLoaded) return;

    window.jpGtmLoaded = true;

    window.dataLayer.push({
      "gtm.start": new Date().getTime(),
      event: "gtm.js"
    });

    const script = document.createElement("script");
    script.async = true;
    script.src =
      "https://www.googletagmanager.com/gtm.js?id=" + GTM_ID;

    const firstScript = document.getElementsByTagName("script")[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  }

  function updateGoogleConsent(analyticsAllowed) {
    window.gtag("consent", "update", {
      analytics_storage: analyticsAllowed ? "granted" : "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied"
    });
  }

  function saveChoice(status) {
    try {
      localStorage.setItem(
        CONSENT_KEY,
        JSON.stringify({
          status: status,
          savedAt: Date.now()
        })
      );
    } catch (error) {
      // If storage is unavailable, the current choice
      // still applies for this page session.
    }
  }

  function getChoice() {
    try {
      const saved = JSON.parse(localStorage.getItem(CONSENT_KEY));

      if (!saved || !saved.savedAt) return null;

      if (Date.now() - saved.savedAt > CONSENT_DURATION) {
        localStorage.removeItem(CONSENT_KEY);
        return null;
      }

      if (saved.status === "accepted" || saved.status === "rejected") {
        return saved.status;
      }
    } catch (error) {
      return null;
    }

    return null;
  }

  function clearAnalyticsCookies() {
    document.cookie.split(";").forEach(function (cookie) {
      const name = cookie.split("=")[0].trim();

      if (/^_ga($|_)|^_gid$|^_gat/.test(name)) {
        document.cookie =
          name + "=; Max-Age=0; path=/; SameSite=Lax";
      }
    });
  }

  function hideBanner() {
    const banner = document.getElementById("jp-cookie-banner");

    if (banner) banner.remove();
  }

  function acceptAnalytics() {
    saveChoice("accepted");

    updateGoogleConsent(true);
    loadGTM();

    hideBanner();
  }

  function rejectAnalytics() {
    saveChoice("rejected");

    updateGoogleConsent(false);
    clearAnalyticsCookies();

    hideBanner();
  }

  function showBanner() {
    if (document.getElementById("jp-cookie-banner")) return;

    const banner = document.createElement("div");

    banner.id = "jp-cookie-banner";
    banner.className = "jp-cookie-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute("aria-label", "Cookie preferences");

    banner.innerHTML = `
      <div class="jp-cookie-content">
        <div class="jp-cookie-copy">
          <h3>Privacy & Cookie Preferences</h3>

          <p>
            This website uses essential browser storage to remember
            your preferences. With your permission, Google Analytics
            helps us understand website traffic and improve the
            visitor experience.
          </p>

          <p>
            Analytics remains disabled unless you allow it.
            Read our
            <a href="/privacy.html">Privacy Policy</a>.
          </p>
        </div>

        <div class="jp-cookie-actions">
          <button type="button" id="jp-accept-cookies">
            Allow Analytics
          </button>

          <button type="button" id="jp-reject-cookies">
            Reject Optional
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    document
      .getElementById("jp-accept-cookies")
      .addEventListener("click", acceptAnalytics);

    document
      .getElementById("jp-reject-cookies")
      .addEventListener("click", rejectAnalytics);
  }

  // Allow visitors to reopen cookie preferences from the footer.
  document.addEventListener("click", function (event) {
    const settingsLink = event.target.closest("#jp-cookie-settings");

    if (!settingsLink) return;

    event.preventDefault();

    updateGoogleConsent(false);
    clearAnalyticsCookies();

    try {
      localStorage.removeItem(CONSENT_KEY);
    } catch (error) {}

    window.location.reload();
  });

  // Restore the saved choice.
  const choice = getChoice();

  if (choice === "accepted") {
    updateGoogleConsent(true);
    loadGTM();
  } else if (choice === "rejected") {
    updateGoogleConsent(false);
  } else {
    showBanner();
  }

})();
