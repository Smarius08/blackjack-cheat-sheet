/**
 * Strategy Explanation Writer
 * =============================
 * Extracted from reference/blackjack_hand_strategy_calculator_mockup_v30.html
 * (getStrategyExplanation() plus its one actual runtime dependency,
 * rankValue(), used to convert dealerRank into a numeric value).
 *
 * Verified by direct reading of the source: isGenericWhy(), hardLabel(),
 * and evLabelFor() are NOT called from inside getStrategyExplanation() —
 * they're used elsewhere in the source file (evaluate() and the render
 * path) alongside getStrategyExplanation() at its call sites, not by it.
 * Deliberately left out of this module as unnecessary.
 */

/**
 * Module format: dual-mode. Under Node (the test suite, CLI scripts) this is a
 * CommonJS module. Loaded in a browser with a plain <script> tag it instead
 * attaches its exports to `window.ChipyEngine.explanationWriter`.
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
    ns.explanationWriter = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {


  const rankValue = r => (['J','Q','K'].includes(r) ? 10 : (r === 'A' ? 11 : parseInt(r)));

  function getStrategyExplanation({ move, total, soft, pair, dealerRank }){
    const dealerValue = rankValue(dealerRank);
    const dealerIsWeak = dealerValue >= 2 && dealerValue <= 6;
    const dealerIsStrong = dealerValue >= 7;

    // Shared VERBATIM between the HIT and DOUBLE branches below: a pair of 5s
    // is a hard 10 whichever move the table sends it to (HIT vs a strong
    // dealer card, DOUBLE vs a weak one), and the "why not split" reasoning is
    // the same move-agnostic story either way. One constant, not two copies,
    // so the two return points cannot drift apart.
    const PAIR_5_SPLIT_NOTE = `You can split this pair, but two 5s are a hard 10, one of the best totals to draw to — splitting would trade it for two hands starting at 5.`;

    if(move === 'HIT'){
      if(soft){
        return 'Your Ace gives this hand extra flexibility because it can count as 1 or 11. Hitting gives you a chance to improve without the same immediate bust risk as a hard hand.';
      }
      // Splittable pairs the table says to HIT. Six return points, one per
      // pair rank (2,3,4,5,6,7) — the same granularity the STAND clauses below
      // already established: `pair` alone decides the string, no dealer-card
      // condition needed, even though these cells span several different
      // dealer up-cards each. `pair` carries the same "never claims a split is
      // available when it isn't" guarantee documented on the STAND clauses.
      //
      // Only 5 and 4 name a reason (a hard 10; unbustable by one card) because
      // their EV gap against the recommended move is large enough to say
      // something specific and still be honest — 5-5's is 0.40–0.68, 4-4's is
      // 0.036–0.324 (6 decks, H17, DAS, see the decision log). 2-2/3-3/6-6/7-7
      // share one sentence making no claim about the size of the margin,
      // because their gaps range from 0.002 to 0.29 depending on the dealer
      // card — a single per-rank string cannot honestly characterise a range
      // that wide.
      if(pair === '5'){
        return PAIR_5_SPLIT_NOTE;
      }
      if(pair === '4'){
        return `You can split this pair, but no single card can bust an 8 — splitting would trade that for two hands starting at 4.`;
      }
      if(pair === '2'){
        return `You can split this pair, but this is one hand you can still build on — splitting would trade it for two hands starting at 2.`;
      }
      if(pair === '3'){
        return `You can split this pair, but this is one hand you can still build on — splitting would trade it for two hands starting at 3.`;
      }
      if(pair === '6'){
        return `You can split this pair, but this is one hand you can still build on — splitting would trade it for two hands starting at 6.`;
      }
      if(pair === '7'){
        return `You can split this pair, but this is one hand you can still build on — splitting would trade it for two hands starting at 7.`;
      }
      if(total <= 11){
        return 'Your total is too low to stand. Hitting gives you a chance to improve the hand without busting on the next card.';
      }
      if(total >= 12 && total <= 16 && dealerIsStrong){
        return `The dealer is showing a strong card, so standing on ${total} is unlikely to be enough. Hitting gives you a better chance to improve the hand.`;
      }
      if(total >= 12 && total <= 16 && dealerIsWeak){
        return `Hard ${total} is a tough hand even against a weaker dealer card — standing here carries too much downside to be the better play. Hitting gives you the best chance to improve.`;
      }
      return `Hitting is the strongest play for this hand against the dealer's card.`;
    }

    if(move === 'STAND'){
      if(soft){
        return `Your Soft ${total} is strong enough to stand against this dealer card. Taking another card does not improve the hand often enough to make hitting the better play.`;
      }
      // A splittable pair the table says to STAND on. Without this the player is
      // told only that the correct move was Stand, and the lesson of the hand —
      // that splitting is AVAILABLE and still wrong — is never stated. `pair` is
      // set only for a two-card, non-post-split hand (handForLookup drops
      // pairRank once a hand comes from a split), so this cannot claim a split
      // is available when it is not.
      //
      // Reached only where the strategy table already resolved to STAND, which
      // for these two ranks is every 10-10 cell and 9-9 against 7, 10 and A —
      // so no dealer-card condition is needed or wanted here. The second clause
      // is deliberately identical in both, so a player who meets both hands
      // sees one pattern rather than two.
      if(pair === '10'){
        return `You can split this pair, but 20 is already one of the strongest hands at the table — splitting trades it for two hands starting at 10.`;
      }
      if(pair === '9'){
        return `You can split this pair, but 18 is strong enough here — splitting would trade it for two hands starting at 9.`;
      }
      if(total >= 17){
        return `Your ${total} is already a strong made hand. Standing avoids the unnecessary risk of taking another card.`;
      }
      if(total >= 12 && total <= 16 && dealerIsWeak){
        return `The dealer is showing a weaker card and must keep drawing to at least 17. Standing avoids adding unnecessary bust risk to your ${total}.`;
      }
      return `Standing is the strongest play for this hand against the dealer's card.`;
    }

    if(move === 'DOUBLE'){
      if(soft){
        return 'Your Ace gives this hand extra flexibility, making this a favorable spot to double for one additional card.';
      }
      // 5-5 is a hard 10 whichever move the table sends it to — HIT against a
      // strong dealer card, DOUBLE against a weak one. Same note as the HIT
      // branch above, read from the shared constant rather than duplicated,
      // so the two return points cannot drift apart.
      if(pair === '5'){
        return PAIR_5_SPLIT_NOTE;
      }
      return 'This is a strong doubling opportunity. Taking exactly one more card gives you good potential to finish with a strong total while increasing your bet.';
    }

    if(move === 'SPLIT'){
      if(pair === 'A'){
        return 'Playing two Aces together gives you Soft 12. Splitting gives each Ace a separate chance to build a strong hand.';
      }
      // AUDIT E2. This compared against the NUMBER 8, which is what v30's own
      // isPair() produces (it returns rankValue(), numeric for everything but
      // Aces). Every engine in THIS repo normalizes ranks to strings, so a real
      // Trainer caller sends '8' and the specific explanation was never reached
      // — it degraded silently to the generic one.
      //
      // Both forms are accepted explicitly. A string-only comparison would have
      // fixed the Trainer and broken parity with v30 in the opposite direction,
      // which engine/verify_extraction.test.js diffs against directly. Two
      // literal comparisons rather than String(pair) === '8': coercion would also
      // admit ['8'] and any object with a toString returning '8', widening the
      // contract to shapes that are never a pair of eights. 'A' needs no such
      // treatment — v30 and this repo already agree on it.
      if(pair === '8' || pair === 8){
        return 'A pair of 8s makes a difficult Hard 16. Splitting avoids playing the cards as one weak hand and gives you two separate hands starting from 8.';
      }
      return 'These cards are stronger when played as two separate hands than as one combined total.';
    }

    if(move === 'SURRENDER'){
      return 'This is a difficult hand against a strong dealer card. Surrendering limits your loss to half of your original bet instead of playing out the full hand.';
    }

    return '';
  }

  return { getStrategyExplanation, rankValue };

});
