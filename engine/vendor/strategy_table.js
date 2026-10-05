/**
 * Strategy Table (Basic Strategy Lookup)
 * ========================================
 * Extracted from reference/blackjack_hand_strategy_calculator_mockup_v30.html
 * (STRATEGY_TABLE constant + resolveCode() function, plus resolveCode()'s own
 * two settings-dependent helpers, surrenderAllowedFor() and
 * doubleAllowedForTotal(), without which resolveCode() cannot run).
 *
 * STRATEGY_TABLE's object literal below was extracted programmatically from
 * the source HTML (not manually retyped) and is byte-identical to the
 * source's `const STRATEGY_TABLE = {...}` statement EXCEPT for two cells
 * corrected on 2026-10-05 against BlackjackInfo's Basic Strategy Engine and
 * Wizard of Odds (Single/H17 Pair 6 vs 7: "H" -> "Ph"; Multi/H17 Pair 8 vs A:
 * "Rp" -> "Rpa", a code v30 does not have). engine/verify_extraction.test.js
 * lists both as INTENTIONAL_DEVIATIONS and fails on any other difference.
 *
 * Deviation from the source, and why: the source file holds a single
 * mutable module-level `settings` object that resolveCode(),
 * surrenderAllowedFor(), and doubleAllowedForTotal() all read as a closure
 * variable. A standalone module has no such global, so `settings` is
 * threaded through as an explicit parameter on all three functions instead
 * (this is the only change made to their logic — see
 * engine/verify_extraction.test.js for a behavioral cross-check against the
 * original source across many inputs).
 * The branching logic, return shapes, and message strings are otherwise
 * unchanged from the source, apart from the added 'Rpa' case that the
 * corrected Multi/H17 cell needs.
 *
 * settings shape (matches the source's `let settings = {...}` at the top of
 * the HTML file): { surrender, dealerHitsSoft17, doubleRestriction,
 * dasAllowed, hitSplitAces, deckCount }. Only settings.surrender,
 * settings.doubleRestriction, and settings.dasAllowed are read here.
 */

/**
 * Module format: dual-mode. Under Node (the test suite, CLI scripts) this is a
 * CommonJS module. Loaded in a browser with a plain <script> tag it instead
 * attaches its exports to `window.ChipyEngine.strategyTable`.
 *
 * The body is wrapped in a function so that top-level names stay private.
 * Several engine modules declare the same ones (RANK_VALUES, classifyHand,
 * rankValue), and two classic scripts declaring the same `const` at top level
 * is a SyntaxError. engine/browser_globals.test.js loads all seven the way a
 * browser does and pins that they stay private.
 *
 * Browser load order (each module must follow its dependencies):
 *   dealer_distribution_engine_v2.js, strategy_table.js, explanation_writer.js,
 *   player_hand_resolver.js, scorekeeper.js, hand_dealer.js, game_controller.js
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    var ns = (root.ChipyEngine = root.ChipyEngine || {});
    ns.strategyTable = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {


  const STRATEGY_TABLE = {"Multi": {"H17": {"Hard": {"18-21": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "17": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "Rs"], "16": ["S", "S", "S", "S", "S", "H", "H", "Rh", "Rh", "Rh"], "15": ["S", "S", "S", "S", "S", "H", "H", "H", "Rh", "Rh"], "14": ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"], "13": ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"], "12": ["H", "H", "S", "S", "S", "H", "H", "H", "H", "H"], "11": ["Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh"], "10": ["Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "H", "H"], "9": ["H", "Dh", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "5-8": ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"]}, "Soft": {"20": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "19": ["S", "S", "S", "S", "Ds", "S", "S", "S", "S", "S"], "18": ["Ds", "Ds", "Ds", "Ds", "Ds", "S", "S", "H", "H", "H"], "17": ["H", "Dh", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "16": ["H", "H", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "15": ["H", "H", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "14": ["H", "H", "H", "Dh", "Dh", "H", "H", "H", "H", "H"], "13": ["H", "H", "H", "Dh", "Dh", "H", "H", "H", "H", "H"], "21": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "12": ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"]}, "Pair": {"A": ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P"], "10": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "9": ["P", "P", "P", "P", "P", "S", "P", "P", "S", "S"], "8": ["P", "P", "P", "P", "P", "P", "P", "P", "P", "Rpa"], "7": ["P", "P", "P", "P", "P", "P", "H", "H", "H", "H"], "6": ["Ph", "P", "P", "P", "P", "H", "H", "H", "H", "H"], "5": ["Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "H", "H"], "4": ["H", "H", "H", "Ph", "Ph", "H", "H", "H", "H", "H"], "3": ["Ph", "Ph", "P", "P", "P", "P", "H", "H", "H", "H"], "2": ["Ph", "Ph", "P", "P", "P", "P", "H", "H", "H", "H"]}}, "S17": {"Hard": {"18-21": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "17": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "16": ["S", "S", "S", "S", "S", "H", "H", "Rh", "Rh", "Rh"], "15": ["S", "S", "S", "S", "S", "H", "H", "H", "Rh", "H"], "14": ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"], "13": ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"], "12": ["H", "H", "S", "S", "S", "H", "H", "H", "H", "H"], "11": ["Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "H"], "10": ["Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "H", "H"], "9": ["H", "Dh", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "5-8": ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"]}, "Soft": {"20": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "19": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "18": ["S", "Ds", "Ds", "Ds", "Ds", "S", "S", "H", "H", "H"], "17": ["H", "Dh", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "16": ["H", "H", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "15": ["H", "H", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "14": ["H", "H", "H", "Dh", "Dh", "H", "H", "H", "H", "H"], "13": ["H", "H", "H", "Dh", "Dh", "H", "H", "H", "H", "H"], "21": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "12": ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"]}, "Pair": {"A": ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P"], "10": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "9": ["P", "P", "P", "P", "P", "S", "P", "P", "S", "S"], "7": ["P", "P", "P", "P", "P", "P", "H", "H", "H", "H"], "6": ["Ph", "P", "P", "P", "P", "H", "H", "H", "H", "H"], "5": ["Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "H", "H"], "4": ["H", "H", "H", "Ph", "Ph", "H", "H", "H", "H", "H"], "3": ["Ph", "Ph", "P", "P", "P", "P", "H", "H", "H", "H"], "2": ["Ph", "Ph", "P", "P", "P", "P", "H", "H", "H", "H"], "8": ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P"]}}}, "Double": {"H17": {"Hard": {"5-8": ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"], "9": ["Dh", "Dh", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "10": ["Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "H", "H"], "11": ["Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh"], "12": ["H", "H", "S", "S", "S", "H", "H", "H", "H", "H"], "13": ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"], "14": ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"], "15": ["S", "S", "S", "S", "S", "H", "H", "H", "Rh", "Rh"], "16": ["S", "S", "S", "S", "S", "H", "H", "H", "Rh", "Rh"], "17": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "Rs"], "18-21": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"]}, "Soft": {"13": ["H", "H", "H", "Dh", "Dh", "H", "H", "H", "H", "H"], "14": ["H", "H", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "15": ["H", "H", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "16": ["H", "H", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "17": ["H", "Dh", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "18": ["Ds", "Ds", "Ds", "Ds", "Ds", "S", "S", "H", "H", "H"], "19": ["S", "S", "S", "S", "Ds", "S", "S", "S", "S", "S"], "20": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "21": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "12": ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"]}, "Pair": {"2": ["Ph", "Ph", "P", "P", "P", "P", "H", "H", "H", "H"], "3": ["Ph", "Ph", "P", "P", "P", "P", "H", "H", "H", "H"], "4": ["H", "H", "H", "Ph", "Ph", "H", "H", "H", "H", "H"], "6": ["P", "P", "P", "P", "P", "Ph", "H", "H", "H", "H"], "7": ["P", "P", "P", "P", "P", "P", "Ph", "H", "H", "H"], "8": ["P", "P", "P", "P", "P", "P", "P", "P", "P", "Rp"], "9": ["P", "P", "P", "P", "P", "S", "P", "P", "S", "S"], "10": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "A": ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P"], "5": ["Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "H", "H"]}}, "S17": {"Hard": {"5-8": ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"], "9": ["Dh", "Dh", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "10": ["Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "H", "H"], "11": ["Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh"], "12": ["H", "H", "S", "S", "S", "H", "H", "H", "H", "H"], "13": ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"], "14": ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"], "15": ["S", "S", "S", "S", "S", "H", "H", "H", "Rh", "H"], "16": ["S", "S", "S", "S", "S", "H", "H", "H", "Rh", "Rh"], "17": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "18-21": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"]}, "Soft": {"13": ["H", "H", "H", "Dh", "Dh", "H", "H", "H", "H", "H"], "14": ["H", "H", "H", "Dh", "Dh", "H", "H", "H", "H", "H"], "15": ["H", "H", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "16": ["H", "H", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "17": ["H", "Dh", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "18": ["S", "Ds", "Ds", "Ds", "Ds", "S", "S", "H", "H", "H"], "19": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "20": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "21": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "12": ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"]}, "Pair": {"2": ["Ph", "Ph", "P", "P", "P", "P", "H", "H", "H", "H"], "3": ["Ph", "Ph", "P", "P", "P", "P", "H", "H", "H", "H"], "4": ["H", "H", "H", "Ph", "Ph", "H", "H", "H", "H", "H"], "6": ["P", "P", "P", "P", "P", "Ph", "H", "H", "H", "H"], "7": ["P", "P", "P", "P", "P", "P", "Ph", "H", "H", "H"], "8": ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P"], "9": ["P", "P", "P", "P", "P", "S", "P", "P", "S", "S"], "10": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "A": ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P"], "5": ["Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "H", "H"]}}}, "Single": {"H17": {"Hard": {"18-21": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "17": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "Rs"], "16": ["S", "S", "S", "S", "S", "H", "H", "H", "Rh", "Rh"], "15": ["S", "S", "S", "S", "S", "H", "H", "H", "H", "Rh"], "14": ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"], "13": ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"], "12": ["H", "H", "S", "S", "S", "H", "H", "H", "H", "H"], "11": ["Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh"], "10": ["Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "H", "H"], "9": ["Dh", "Dh", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "8": ["H", "H", "H", "Dh", "Dh", "H", "H", "H", "H", "H"], "5-7": ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"]}, "Soft": {"20": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "19": ["S", "S", "S", "S", "Ds", "S", "S", "S", "S", "S"], "18": ["S", "Ds", "Ds", "Ds", "Ds", "S", "S", "H", "H", "H"], "17": ["Dh", "Dh", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "16": ["H", "H", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "15": ["H", "H", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "14": ["H", "H", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "13": ["H", "H", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "21": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "12": ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"]}, "Pair": {"A": ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P"], "9": ["P", "P", "P", "P", "P", "S", "P", "P", "S", "Ps"], "8": ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P"], "7": ["P", "P", "P", "P", "P", "P", "Ph", "H", "Rs", "Rh"], "6": ["P", "P", "P", "P", "P", "Ph", "H", "H", "H", "H"], "4": ["H", "H", "Ph", "Pd", "Pd", "H", "H", "H", "H", "H"], "3": ["Ph", "Ph", "P", "P", "P", "P", "Ph", "H", "H", "H"], "2": ["Ph", "P", "P", "P", "P", "P", "H", "H", "H", "H"], "5": ["Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "H", "H"], "10": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"]}}, "S17": {"Hard": {"17": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "18-21": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "16": ["S", "S", "S", "S", "S", "H", "H", "H", "Rh", "Rh"], "15": ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"], "14": ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"], "13": ["S", "S", "S", "S", "S", "H", "H", "H", "H", "H"], "12": ["H", "H", "S", "S", "S", "H", "H", "H", "H", "H"], "11": ["Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh"], "10": ["Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "H", "H"], "9": ["Dh", "Dh", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "8": ["H", "H", "H", "Dh", "Dh", "H", "H", "H", "H", "H"], "5-7": ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"]}, "Soft": {"20": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "19": ["S", "S", "S", "S", "Ds", "S", "S", "S", "S", "S"], "18": ["S", "Ds", "Ds", "Ds", "Ds", "S", "S", "H", "H", "S"], "17": ["Dh", "Dh", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "16": ["H", "H", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "15": ["H", "H", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "14": ["H", "H", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "13": ["H", "H", "Dh", "Dh", "Dh", "H", "H", "H", "H", "H"], "21": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"], "12": ["H", "H", "H", "H", "H", "H", "H", "H", "H", "H"]}, "Pair": {"A": ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P"], "9": ["P", "P", "P", "P", "P", "S", "P", "P", "S", "S"], "8": ["P", "P", "P", "P", "P", "P", "P", "P", "P", "P"], "7": ["P", "P", "P", "P", "P", "P", "Ph", "H", "Rs", "H"], "6": ["P", "P", "P", "P", "P", "Ph", "H", "H", "H", "H"], "4": ["H", "H", "Ph", "Pd", "Pd", "H", "H", "H", "H", "H"], "3": ["Ph", "Ph", "P", "P", "P", "P", "Ph", "H", "H", "H"], "2": ["Ph", "P", "P", "P", "P", "P", "H", "H", "H", "H"], "5": ["Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "Dh", "H", "H"], "10": ["S", "S", "S", "S", "S", "S", "S", "S", "S", "S"]}}}};

  // ---- resolveCode()'s settings-dependent helpers -------------------------
  // (source lines 565-566 of the v30 mockup; not exported separately there,
  // but resolveCode() cannot run without them)

  // ---- Legal values for the settings these predicates read -----------------
  //
  // Exported so callers validate against ONE list rather than each keeping its
  // own copy. The values are the `value` attributes of v30's own controls, as
  // recorded in docs/product/01-rule-settings.md: Surrender is a dropdown of
  // none/any/except_ace, and Double down is a dropdown of 0/1/2. They live here
  // because the two predicates below are what give them meaning — every branch
  // in surrenderAllowedFor() and doubleAllowedForTotal() keys off one of them.
  const SURRENDER_VALUES = ['none', 'any', 'except_ace'];
  const DOUBLE_RESTRICTIONS = [0, 1, 2];

  function surrenderAllowedFor(d, settings){ if(settings.surrender === 'none') return false; if(settings.surrender === 'except_ace' && d === 11) return false; return true; }

  function doubleAllowedForTotal(total, settings){ if(settings.doubleRestriction === 0) return true; if(settings.doubleRestriction === 1) return [9,10,11].includes(total); if(settings.doubleRestriction === 2) return [10,11].includes(total); return true; }

  // ---- resolveCode() -------------------------------------------------------

  /**
   * TEMPORARY no-resplit enforcement — see options.splitAvailable below.
   *
   * Raised instead of returning SPLIT for a hand that already came from a split.
   * It deliberately does NOT substitute a replacement move: choosing one requires
   * re-looking-up the hand as its plain Hard/Soft total (what v30's evaluate()
   * does by nulling the pair before lookup), and resolveCode() has neither the
   * deck group nor the ruleset needed to do that. Inventing a fallback here would
   * be wrong for real cells — a post-split pair of 9s vs 2 plays as Hard 18 and
   * STANDS, so a blanket "fall back to Hit" would hand the player a wrong answer.
   * Failing loudly is the honest option until the caller layer exists.
   */
  function noResplitAvailable(whyLabel){
    throw new RangeError(
      `resolveCode: Split is not available for a post-split hand (${whyLabel}) — the Trainer never ` +
      `offers a second split. Look this hand up as its plain Hard/Soft total instead, the way v30's ` +
      `evaluate() does by discarding the pair when allowSplit is false. Pass ` +
      `options.splitAvailable = true only to reproduce v30's own source behavior.`
    );
  }

  /**
   * @param {object} [options]
   * @param {boolean} [options.splitAvailable] — whether Split is an offerable
   *   action for this hand. Defaults to `!postSplit`, which is the locked Trainer
   *   rule: no resplitting, ever. Pass `true` explicitly only to reproduce v30's
   *   unrestricted source behavior (the extraction verifier does this).
   *
   *   TEMPORARY STAND-IN. This belongs in a game-state layer, not in a table
   *   lookup — v30 enforced it in evaluate() and by disabling the Split button,
   *   neither of which exists in this repo yet. Revisit when the driver is built.
   */
  function resolveCode(code, d, total, firstDecision, whyLabel, postSplit, settings, options){
    const splitAvailable = (options && options.splitAvailable !== undefined)
      ? options.splitAvailable
      : !postSplit;
    const split = () => {
      if(!splitAvailable) noResplitAvailable(whyLabel);
      return { move:'SPLIT', why: whyLabel, note: null };
    };
    switch(code){
      case 'H': return { move:'HIT', why: whyLabel, note: null };
      case 'S': return { move:'STAND', why: whyLabel, note: null };
      case 'P': return split();
      case 'Dh':
      case 'Ds': {
        const fallback = code === 'Dh' ? 'Hit' : 'Stand';
        if(!firstDecision) return { move: fallback.toUpperCase(), why: whyLabel, note: null }; // never legal past the first two cards, resolved silently
        if(postSplit && !settings.dasAllowed) return { move: fallback.toUpperCase(), why: whyLabel, note: `Basic strategy says Double, but Double after split isn't allowed. Use ${fallback} instead.` };
        if(!doubleAllowedForTotal(total, settings)) return { move: fallback.toUpperCase(), why: whyLabel, note: `Basic strategy says Double, but your Double down setting doesn't allow it on this total. Use ${fallback} instead.` };
        return { move:'DOUBLE', why: whyLabel, note: null };
      }
      case 'Ph': {
        if(settings.dasAllowed) return split();
        return { move:'HIT', why: whyLabel, note: `Basic strategy says Split, but Double after split isn't allowed. Hit instead.` };
      }
      case 'Rh':
      case 'Rs': {
        const fallback = code === 'Rh' ? 'Hit' : 'Stand';
        if(!firstDecision) return { move: fallback.toUpperCase(), why: whyLabel, note: null }; // never legal past the first two cards, resolved silently
        if(postSplit) return { move: fallback.toUpperCase(), why: whyLabel, note: `Basic strategy says Surrender, but Surrender isn't allowed after a split. Use ${fallback} instead.` };
        if(!surrenderAllowedFor(d, settings)) return { move: fallback.toUpperCase(), why: whyLabel, note: `Basic strategy says Surrender, but your Surrender setting doesn't allow it against this dealer card. Use ${fallback} instead.` };
        return { move:'SURRENDER', why: whyLabel, note: null };
      }
      case 'Rp': {
        // Rp genuinely means: Surrender if allowed AND DAS is not allowed; otherwise plain Split (DAS being available tips the balance toward splitting, not a "settings blocked it" fallback).
        if(!firstDecision) return split();
        if(postSplit) return split(); // Surrender never applies post-split; Rp's non-surrender branch is plain Split, so no note needed
        if(surrenderAllowedFor(d, settings) && !settings.dasAllowed) return { move:'SURRENDER', why: whyLabel, note: null };
        return split();
      }
      case 'Rpa': {
        // Rpa: Surrender if allowed, otherwise Split — regardless of DAS. NOT in v30; added 2026-10-05 for the
        // 4-8 deck H17 pair of 8s vs Ace only (see INTENTIONAL_DEVIATIONS in engine/verify_extraction.test.js).
        // Unlike Rp, Split here is a settings-blocked fallback, so it carries the same note Rh/Rs do.
        if(!firstDecision) return split();
        if(postSplit) return split(); // Surrender never applies post-split; same as Rp
        if(surrenderAllowedFor(d, settings)) return { move:'SURRENDER', why: whyLabel, note: null };
        if(!splitAvailable) noResplitAvailable(whyLabel);
        return { move:'SPLIT', why: whyLabel, note: `Basic strategy says Surrender, but your Surrender setting doesn't allow it against this dealer card. Use Split instead.` };
      }
      case 'Pd':
      case 'Ps': {
        // Split if DAS allowed. Otherwise: Pd wants Double, Ps wants Stand — but Double still has to respect
        // the Double Down restriction setting, same as every other Double-capable code (Dh/Ds).
        if(settings.dasAllowed) return split();
        if(code === 'Pd'){
          if(doubleAllowedForTotal(total, settings)) return { move:'DOUBLE', why: whyLabel, note: `Basic strategy says Split, but Double after split isn't allowed. Use Double instead.` };
          return { move:'HIT', why: whyLabel, note: `Basic strategy says Split, but Double after split isn't allowed, and your Double down setting doesn't allow doubling this total either. Use Hit instead.` };
        }
        return { move:'STAND', why: whyLabel, note: `Basic strategy says Split, but Double after split isn't allowed. Use Stand instead.` };
      }
      default:
        console.error(`Unrecognized strategy code: "${code}" for ${whyLabel}`);
        return { move:'UNAVAILABLE', why: whyLabel, note: 'This is a data error, not a real Blackjack recommendation — please report it.' };
    }
  }

  return { STRATEGY_TABLE, resolveCode, surrenderAllowedFor, doubleAllowedForTotal, SURRENDER_VALUES, DOUBLE_RESTRICTIONS };

});
