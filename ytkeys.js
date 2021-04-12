(// ==UserScript==
// @name         ytkeys
// @namespace    https://github.com/laci37/ytkeys
// @updateURL    https://raw.githubusercontent.com/laci37/ytkeys/master/ytkeys.js
// @downloadURL  https://raw.githubusercontent.com/laci37/ytkeys/master/ytkeys.js
// @version      0.0.1
// @license      AGPLv3
// @author       jcunews, laci37
// @description  Adds more keyboard shortcuts for YouTube. The list of all new shortcuts is added into new "More Shortcuts" section on YouTube's "Keyboard shortcuts" popup which can be accessed via "?" or SHIFT+/ key (on U.S. keyboards).
// @match        *://www.youtube.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==
ch => {

  //=== CONFIGURATION BEGIN
  /*
  `key` is the key name. If it's a letter, it must be in uppercase.
  `mods` is a zero or up to 3 modifier key characters (in any order): `A`=Alt, `C`=Control, `S`=Shift. Character case is ignored.
    e.g. "" (no modifier key), "s" (Shift), "Cs" (Control+Shift), "aSc" (Control+Shift+Alt).
  `desc` is the hotkey description which will be added onto YouTube's Hotkey List Popup (accessible via `?` or `SHIFT+/` key).
    If this property is empty or doesn't exist, the hotkey won't be included in YouTube's Hotkey List Popup.
  `keys` is an optional custom text representation for the keyboard keys which is useful to represent multiple hotkeys.
  `func` is the JavaScript function to execute with the activated hotkey object as the first argument.
  */

  var hotkeys = [
    {key: "`", mods: "C", desc: "Toggle guide / sidebar", func: a => eleClick('#guide-button')},
    {key: ")", mods: "S", desc: "Seek to specific point in the video (SHIFT+7 advances to 75% of duration)", keys: "SHIFT+0..SHIFT+9", func: a => videoSeekTo(0.05)},
    {key: "!", mods: "S", func: a => videoSeekTo(0.15)},
    {key: "@", mods: "S", func: a => videoSeekTo(0.25)},
    {key: "#", mods: "S", func: a => videoSeekTo(0.35)},
    {key: "$", mods: "S", func: a => videoSeekTo(0.45)},
    {key: "%", mods: "S", func: a => videoSeekTo(0.55)},
    {key: "^", mods: "S", func: a => videoSeekTo(0.65)},
    {key: "&", mods: "S", func: a => videoSeekTo(0.75)},
    {key: "*", mods: "S", func: a => videoSeekTo(0.85)},
    {key: "(", mods: "S", func: a => videoSeekTo(0.95)},
    {key: "H", mods: "", func: a => change_selected(-1)},
    {key: "L", mods: "", func: a => change_selected(1)},
    {key: "J", mods: "", func: a => change_selected(4)},
    {key: "K", mods: "", func: a => change_selected(-4)},
    {key: "G", mods: "", func: a => click_selected()},
    {key: "J", mods: "A", func: a => videoSeekChapter(-1), desc: "Seek to previous chapter"},
    {key: "L", mods: "A", func: a => videoSeekChapter(1), desc: "Seek to next chapter"},
    {key: "C", mods: "S", desc: "Select preferred subtitle language", func: selectCaption},
    {key: "J", mods: "S", desc: "Rewind video by 30 seconds", func: a => videoSeekBy(-30)},
    {key: "L", mods: "S", desc: "Fast forward video by 30 seconds", func: a => videoSeekBy(30)},
    {key: "E", mods: "", desc: "Toggle like video", func: a => eleClick('#text[aria-label*=" like"]')},
    {key: "E", mods: "S", desc: "Toggle dislike video", func: a => eleClick('#text[aria-label*=" dislike"]')},
    {key: "H", mods: "", desc: "Share video", func: a => eleClick('#button[aria-label="Share"]')},
    {key: "Q", mods: "S", desc: "Toggle YouTube video controls", func: toggleYtVideoControls},
    {key: "V", mods: "", desc: "Save video into playlist", func: a => eleClick('#button[aria-label^="Save"]')},
    {key: "U", mods: "", desc: "Toggle subscription", func: a => eleClick('paper-button.ytd-subscribe-button-renderer')},
    {key: "Y", mods: "", desc: "Toggle subscription notification", func: a => eleClick('ytd-watch-flexy #notification-preference-toggle-button > .ytd-subscribe-button-renderer')},
    {key: "R", mods: "", desc: "Toggle replay chat or chapter list", func: toggleChatChap},
    {key: "X", mods: "", desc: "Toggle autoplay of next non-playlist video", func: a => eleClick('paper-toggle-button.ytd-compact-autoplay-renderer')},
    {key: "V", mods: "S", desc: "Go to user/channel video page", func: a => navUser("Videos", "videos")},
    {key: "Y", mods: "S", desc: "Go to user/channel playlists page", func: a => navUser("Playlists", "playlists")},
    {key: "`", mods: "", desc: "Go to YouTube home page", func: a => eleClick('a#logo')}
  ];
  var subtitleLanguageCode = "en"; //2-letters language code for select preferred subtitle language hotkey

  //=== CONFIGURATION END

  var baseKeys = {};
  ("~`!1@2#3$4%5^6&7*8(9)0_-+={[}]:;\"'|\\<,>.?/").split("").forEach((c, i, a) => {
    if ((i & 1) === 0) baseKeys[c] = a[i + 1];
  });

  function eleClick(s, e) {
    if ((e = document.querySelector(s)) && !e.disabled) {
      e.click();
      return true
    } else return false
  }

  function videoSeekBy(t, v) {
    (v = document.querySelector('.html5-video-player')) && v.seekBy(t);
  }

  function videoSeekTo(p, v) {
    (v = document.querySelector('.html5-video-player')) && v.seekTo(v.getDuration() * p);
  }

  function videoSeekChapter(d, v, s, t) {
    if (
      (v = document.querySelector('.html5-video-player')) && (s = v.getPlayerResponse().videoDetails) &&
      (s = s.shortDescription)
    ) {
      t = v.getCurrentTime();
      s = s.match(/^\s*(\d{1,2}:)?\d{1,2}:\d{1,2}\s+\S+.*/gm).map(s => {
        s = s.match(/^\s*(\d{1,2}:)?(\d{1,2}):(\d{1,2})/);
        s[1] = s[1] ? parseInt(s[1]) : 0;
        s[2] = s[2] ? parseInt(s[2]) : 0;
        s[3] = s[3] ? parseInt(s[3]) : 0;
        return (s[1] * 3600) + (s[2] * 60) + s[3]
      });
      if (s.length && (s[0] > 1)) s.unshift(0);
      s.some((c, i) => {
        if ((d < 0) && ((c + 1) >= t) && i) {
          if (s[i - 1] !== t) v.seekTo(s[i - 1]);
          return true
        } else if ((d > 0) && (c > t) && i) {
          v.seekTo(c);
          return true
        }
      })
    }
  }

  function selectCaption(v, o, c, a) {
    if (
      (v = document.querySelector('.html5-video-player')) && (o = v.getPlayerResponse().captions) &&
      (o = o.playerCaptionsTracklistRenderer) && (o = o.captionTracks)
    ) {
      if ((c = v.getOption("captions", "track")) && c.vss_id) {
        if (c.vss_id === ("." + subtitleLanguageCode)) {
          a = o.find(ct => ct.vssId === ("a." + subtitleLanguageCode));
          if (!a) a = o.find(ct => ct.isTranslatable && (ct.vssId[0] === ".") && (ct.vssId.substr(1) !== subtitleLanguageCode));
          if (!a) a = o.find(ct => ct.isTranslatable && (ct.vssId[1] === ".") && (ct.vssId.substr(2) !== subtitleLanguageCode));
        }
        if (!a && (c.vss_id === ("a." + subtitleLanguageCode))) {
          a = o.find(ct => ct.isTranslatable && (ct.vssId[0] === ".") && (ct.vssId.substr(1) !== subtitleLanguageCode));
          if (!a) a = o.find(ct => ct.isTranslatable && (ct.vssId[1] === ".") && (ct.vssId.substr(2) !== subtitleLanguageCode));
        }
        if (!a && c.is_translateable && (c.vss_id[0] === ".") && (c.vss_id.substr(1) !== subtitleLanguageCode)) {
          a = o.find(ct => ct.isTranslatable && (ct.vssId[1] === ".") && (ct.vssId.substr(2) !== subtitleLanguageCode));
        }
      }
      if (!a) {
        a = o.find(ct => ct.vssId === ("." + subtitleLanguageCode));
        if (!a) a = o.find(ct => ct.vssId === ("a." + subtitleLanguageCode));
        if (!a) a = o.find(ct => ct.isTranslatable && (ct.vssId[0] === ".") && (ct.vssId.substr(1) !== subtitleLanguageCode));
        if (!a) a = o.find(ct => ct.isTranslatable && (ct.vssId[1] === ".") && (ct.vssId.substr(2) !== subtitleLanguageCode));
        if (!a) {
          a = o.find(ct => ct.isTranslatable && (
            ((ct.vssId[0] === ".") && (ct.vssId.substr(1) !== subtitleLanguageCode)) ||
            ((ct.vssId[1] === ".") && (ct.vssId.substr(2) !== subtitleLanguageCode))
          ));
        }
        if (!a) return;
      }
      a = {languageCode: a.languageCode, vss_id: a.vssId};
      if (a.languageCode !== subtitleLanguageCode) {
        v.getPlayerResponse().captions.playerCaptionsTracklistRenderer.translationLanguages.some(l => {
          if (l.languageCode === subtitleLanguageCode) {
            a.translationLanguage = {languageCode: subtitleLanguageCode};
            a.translationLanguage.languageName = l.languageName.simpleText;
            return true;
          }
        });
      }
      if (!c.languageCode) v.toggleSubtitles();
      v.setOption("captions", "track", a);
    }
  }

  function toggleChatChap() {
    eleClick('ytd-engagement-panel-section-list-renderer[visibility="ENGAGEMENT_PANEL_VISIBILITY_EXPANDED"] .yt-icon-button') ||
      eleClick('#show-hide-button.ytd-live-chat-frame > ytd-toggle-button-renderer.ytd-live-chat-frame') ||
      eleClick('.ytp-chapter-title')
  }

  function toggleYtVideoControls(v) {
    if (v = document.querySelector('.html5-video-player')) {
      if (v.classList.contains("ytp-autohide-active")) {
        v.classList.remove("ytp-autohide-active")
      } else if (v.classList.contains("ytp-autohide")) {
        v.classList.remove("ytp-autohide")
      } else v.classList.add("ytp-autohide")
    }
  }

  function navUser(tn, tp, a) {
    if ((new RegExp(`^/(channel|user)/[^/]+/${tp}$`)).test(location.pathname)) {
      Array.from(document.querySelectorAll('.paper-tab')).some(e => {
        if (e.textContent.trim() === tn) {
          e.parentNode.click();
          return true;
        }
      });
    } else if (
      (
        ((a = document.querySelectorAll('#owner-name > a')) && (a = a[a.length - 1])) ||
        (a = document.querySelector('#meta-contents .ytd-channel-name > a'))
      ) &&
      ((a = a.pathname + "/" + tp) !== location.pathname)
    ) nav.navigate({commandMetadata: {webCommandMetadata: {url: a, webPageType: "WEB_PAGE_TYPE_BROWSE"}}}, false);
  }

  function checkHotkeyPopup(a, b, c, d, e) {
    if ((a = document.querySelector("#sections.ytd-hotkey-dialog-renderer")) && !a.querySelector(".more-hotkeys")) {
      a.appendChild(b = (d = a.firstElementChild).cloneNode(false));
      a.appendChild(d.cloneNode(false));
      b.classList.add("more-hotkeys");
      b.appendChild(d.firstElementChild.cloneNode(false)).textContent = "More Hotkeys";
      c = b.appendChild((d = d.children[1]).cloneNode(false));
      c.innerHTML = "";
      d = d.firstElementChild;
      hotkeys.forEach((h, e, f) => {
        if (h.desc) {
          e = c.appendChild(d.cloneNode(true));
          e.firstElementChild.textContent = h.desc;
          if (!(f = h.keys)) {
            if (h.ctrl || h.alt) {
              f = (h.ctrl ? "CTRL+" : "") + (h.shift ? "SHIFT+" : "") + (h.alt ? "ALT+" : "") + h.key;
            } else if (h.shift) {
              f = h.key + " (" + (h.shift ? "SHIFT+" : "") + (h.shift ? baseKeys[h.key] || h.key.toLowerCase() : h.key) + ")";
            } else f = h.key.toLowerCase();
          }
          e.children[1].textContent = f;
        }
      });
    } if (--ch) setTimeout(checkHotkeyPopup, 100);
  }

  function editable(e) {
    var r = false;
    while (e) {
      if (e.contentEditable === "true") return true;
      e = e.parentNode;
    }
    return r;
  }

  hotkeys.forEach(h => {
    var a = h.mods.toUpperCase().split("");
    h.shift = a.includes("S");
    h.ctrl = a.includes("C");
    h.alt = a.includes("A");
  });
  addEventListener("keydown", (ev, a) => {
    if ((a = document.activeElement) && (editable(a) || (a.tagName === "INPUT") || (a.tagName === "TEXTAREA"))) return;
    if ((ev.key === "?") && ev.shiftKey && !ev.ctrlKey && !ev.altKey) {
      ch = 10;
      setTimeout(checkHotkeyPopup, 100);
    }
    hotkeys.forEach(h => {
      if ((ev.key.toUpperCase() === h.key) && (ev.shiftKey === h.shift) && (ev.ctrlKey === h.ctrl) && (ev.altKey === h.alt)) {
        ev.preventDefault();
        ("function" === typeof h.func) && h.func(h);
      }
    });
  }, true);
  var style = document.createElement('style');
  style.appendChild(
      document.createTextNode(
          ".highlight-border { border: 10px solid #05f } "
      )
  )
  document.head.append(style);
  var selectable, selected;
  selected = 0;
  function update_selection(scroll) {
     console.log(selected);
     console.log(selectable);
     selectable.forEach(function (elem) { elem.classList.remove("highlight-border") })
     if (selected >= 0 && selected < selectable.length) {
       selectable[selected].classList.add("highlight-border");
       if(scroll){
         selectable[selected].scrollIntoView({"block": "center"});
       }
     }
  }
  function change_selected(n) {
     let new_selected = selected + n;
     if (new_selected => 0 && new_selected < selectable.length) {
       selected=new_selected;
       update_selection(true);
     }
  }
  function click_selected() {
     selectable[selected].click();
  }
  function update_selectable() {
      if(document.querySelector('a#thumbnail')) {
        selectable = document.querySelectorAll("a#thumbnail");
        update_selection(false);
      }
      setTimeout(update_selectable, 200);
  }
  update_selectable();
})();
