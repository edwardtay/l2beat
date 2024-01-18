# Diff at Thu, 18 Jan 2024 09:27:38 GMT

- author: Michał Podsiadły (<michal.podsiadly@l2beat.com>)
- comparing to: master@0cb1eb82b45ad89a272a3c1b8f8f24ae020627cc block: 18612421
- current block number: 19032852

## Description

Verifier has been changed to AlwaysReverting contract.
Further verification has been stopped.

## Watched changes

```diff
    contract RollupProcessor (0x737901bea3eeb88459df9ef1BE8fF3Ae1B42A2ba) {
      values.verifier:
-        "0xd3a6D9De4cbC2CC7529361941e85b1c3269CcBb1"
+        "0xc0CFF28c45dA7d36B8cD1e3dCd6451e812CA30d1"
    }
```

```diff
-   Status: DELETED
    contract TurboVerifier (0xd3a6D9De4cbC2CC7529361941e85b1c3269CcBb1) {
    }
```

```diff
+   Status: CREATED
    contract AlwaysReverting (0xc0CFF28c45dA7d36B8cD1e3dCd6451e812CA30d1) {
    }
```

## Source code changes

```diff
.../.code/AlwaysReverting/AlwaysReverting.sol      |   10 +
 .../aztec/ethereum/.code/AlwaysReverting/meta.txt  |    2 +
 .../interfaces/IVerifier.sol => /dev/null          |    7 -
 .../TurboVerifier/meta.txt => /dev/null            |    2 -
 .../verifier/TurboVerifier.sol => /dev/null        |  451 ------
 .../cryptography/Bn254Crypto.sol => /dev/null      |  163 --
 .../cryptography/PolynomialEval.sol => /dev/null   | 1610 --------------------
 .../cryptography/Transcript.sol => /dev/null       |  262 ----
 .../verifier/cryptography/Types.sol => /dev/null   |  125 --
 .../verifier/keys/EscapeHatchVk.sol => /dev/null   |   62 -
 .../verifier/keys/Rollup1x1Vk.sol => /dev/null     |   62 -
 .../verifier/keys/Rollup1x2Vk.sol => /dev/null     |   62 -
 .../verifier/keys/Rollup1x4Vk.sol => /dev/null     |   62 -
 .../verifier/keys/Rollup28x1Vk.sol => /dev/null    |   62 -
 .../verifier/keys/Rollup28x2Vk.sol => /dev/null    |   62 -
 .../verifier/keys/Rollup28x4Vk.sol => /dev/null    |   62 -
 .../keys/VerificationKeys.sol => /dev/null         |   60 -
 17 files changed, 12 insertions(+), 3114 deletions(-)
```

# Diff at Mon, 20 Nov 2023 10:32:26 GMT

- author: Luca Donno (<donnoh99@gmail.com>)
- comparing to: master@

## Description

Provide description of changes. This section will be preserved.

## Watched changes

```diff
+   Status: CREATED
    contract AztecFeeDistributor (0x41A57F5581aDf11b25F3eDb7C1DB19f18bb76734) {
    }
```

```diff
+   Status: CREATED
    contract RollupProcessor (0x737901bea3eeb88459df9ef1BE8fF3Ae1B42A2ba) {
    }
```

```diff
+   Status: CREATED
    contract TurboVerifier (0xd3a6D9De4cbC2CC7529361941e85b1c3269CcBb1) {
    }
```

```diff
+   Status: CREATED
    contract Aztec Multisig (0xE298a76986336686CC3566469e3520d23D1a8aaD) {
    }
```
