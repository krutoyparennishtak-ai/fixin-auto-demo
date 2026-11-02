var FixinModeration = (function () {
  // Hard-offensive patterns only. Profanity is allowed — keeps the lively tone.
  // Covers: racist/ethnic slurs, misogyny, homophobia, calls to violence.
  var BLOCKED_PATTERNS = [
    // Racial slurs
    /\bn[i1!]gg[e3]r/i,
    /\bn[i1!]gg[a@]/i,
    /\bk[i1!]ke\b/i,
    /\bsp[i1!]c\b/i,
    /\bch[i1!]nk\b/i,
    /\bw[e3]tb[a@]ck/i,
    /\bg[o0][o0]k\b/i,
    /\bcoon\b/i,
    /\bdarkie/i,
    /\brag\s*head/i,
    /\btowel\s*head/i,

    // Misogynistic
    /\bkill\s*(all\s*)?women/i,
    /\bwomen\s*deserve\s*(to\s*)?die/i,

    // Homophobic slurs
    /\bf[a@]gg[o0]t/i,
    /\btr[a@]nn[yi1!e3]/i,
    /\bdyke\b/i,

    // Calls to violence / extremism
    /\bkill\s*(all|them|every)/i,
    /\bgenocide\s*(is\s*)?(good|based|needed)/i,
    /\bgas\s*(the|all)\b/i,
    /\bexterminate/i,
    /\beth?nic\s*cleansing/i,
    /\bh[o0]l[o0]caust\s*(was\s*)?(fake|hoax|didn'?t)/i,
    /\brace\s*war/i,
    /\bwhite\s*power/i,
    /\bheil\s*h[i1!]tler/i,
    /\b14\s*88\b/i,
    /\bsieg\s*heil/i,
  ];

  function normalize(text) {
    return text
      .replace(/0/g, 'o')
      .replace(/@/g, 'a')
      .replace(/1/g, 'i')
      .replace(/3/g, 'e')
      .replace(/\$/g, 's')
      .toLowerCase()
      .trim();
  }

  function check(text) {
    if (!text || !text.trim()) {
      return { pass: false, reason: 'Message cannot be empty' };
    }
    if (text.trim().length > 200) {
      return { pass: false, reason: 'Maximum 200 characters' };
    }

    var normalized = normalize(text);

    for (var i = 0; i < BLOCKED_PATTERNS.length; i++) {
      if (BLOCKED_PATTERNS[i].test(normalized)) {
        return {
          pass: false,
          reason: 'Message contains inappropriate content',
        };
      }
    }

    return { pass: true };
  }

  return { check: check };
})();
