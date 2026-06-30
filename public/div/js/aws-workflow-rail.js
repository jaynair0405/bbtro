/* ===========================================================================
 * AWS Workflow Rail — a numbered, fixed left-side stepper shown on every AWS
 * page so the pipeline order is obvious and hard to do out of sequence.
 *
 *   1 Upload  -> aws-upload.html   (import CMS file; auto-parses new rows)
 *   2 Parse   -> aws-review.html   (raw text -> events: code, location, split)
 *   3 Match   -> aws-review.html   (link each event to its signal + rake)
 *   4 Classify-> aws.html          (apply JPO rules over the selected period)
 *
 * Self-contained: injects its own <style> and DOM, highlights the step(s) that
 * live on the current page. Include once per page:
 *   <script src="/div/js/aws-workflow-rail.js"></script>
 * ======================================================================== */
(function () {
  if (document.querySelector('.aws-rail')) return; // guard against double-include

  var STEPS = [
    { n: 1, label: 'Upload',   icon: 'bi-cloud-upload',     href: '/div/aws-upload.html', pages: ['aws-upload.html'] },
    { n: 2, label: 'Parse',    icon: 'bi-lightning-charge', href: '/div/aws-review.html', pages: ['aws-review.html'] },
    { n: 3, label: 'Match',    icon: 'bi-link-45deg',       href: '/div/aws-review.html', pages: ['aws-review.html'] },
    { n: 4, label: 'Classify', icon: 'bi-tag',              href: '/div/aws.html',        pages: ['aws.html'] }
  ];

  // Current page = last path segment (default to the dashboard).
  var path = window.location.pathname;
  var current = path.substring(path.lastIndexOf('/') + 1) || 'aws.html';

  var css = '' +
    '.aws-rail{position:fixed;left:14px;top:50%;transform:translateY(-50%);z-index:1035;' +
      'display:flex;flex-direction:column;padding:14px 8px 10px;width:96px;' +
      'background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.03));' +
      'border:1px solid rgba(255,255,255,.12);border-radius:18px;' +
      'box-shadow:0 12px 30px rgba(0,0,0,.35);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);' +
      'font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;}' +
    '.aws-rail__title{font-size:.55rem;letter-spacing:.14em;text-transform:uppercase;' +
      'color:rgba(255,255,255,.5);text-align:center;margin-bottom:10px;font-weight:700;}' +
    '.aws-rail__step{position:relative;display:flex;flex-direction:column;align-items:center;' +
      'text-decoration:none;color:rgba(255,255,255,.7);padding:7px 4px;transition:color .15s;}' +
    '.aws-rail__step:hover{color:#fff;}' +
    '.aws-rail__step:not(:last-child)::after{content:"";position:absolute;top:40px;left:50%;' +
      'width:2px;height:calc(100% - 26px);background:rgba(255,255,255,.15);transform:translateX(-50%);}' +
    '.aws-rail__step--active:not(:last-child)::after{background:linear-gradient(180deg,#6ee7ff,rgba(255,255,255,.15));}' +
    '.aws-rail__num{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;' +
      'justify-content:center;font-size:.9rem;font-weight:700;position:relative;z-index:1;' +
      'background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);color:rgba(255,255,255,.85);}' +
    '.aws-rail__label{font-size:.62rem;margin-top:5px;text-align:center;line-height:1.1;}' +
    '.aws-rail__step--active .aws-rail__num{background:linear-gradient(135deg,#6ee7ff,#a78bfa);' +
      'border-color:#6ee7ff;color:#08101f;box-shadow:0 0 12px rgba(110,231,255,.5);}' +
    '.aws-rail__step--active .aws-rail__label{color:#fff;font-weight:600;}' +
    '@media (max-width:1100px){.aws-rail{width:54px;}.aws-rail__label{display:none;}' +
      '.aws-rail__num{width:30px;height:30px;}}' +
    '@media (max-width:820px){.aws-rail{display:none;}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var rail = document.createElement('nav');
  rail.className = 'aws-rail';
  rail.setAttribute('aria-label', 'AWS workflow steps');

  var html = '<div class="aws-rail__title">AWS<br>Flow</div>';
  STEPS.forEach(function (s) {
    var active = s.pages.indexOf(current) !== -1 ? ' aws-rail__step--active' : '';
    html += '<a class="aws-rail__step' + active + '" href="' + s.href + '" ' +
            'title="Step ' + s.n + ': ' + s.label + '">' +
              '<span class="aws-rail__num">' + s.n + '</span>' +
              '<span class="aws-rail__label">' + s.label + '</span>' +
            '</a>';
  });
  rail.innerHTML = html;
  document.body.appendChild(rail);
})();
