import unittest
from rules_engine import ClaimEvaluator

class TestClaimEvaluator(unittest.TestCase):
    def setUp(self):
        # Sample claim data for testing
        self.valid_claim_data = {
            "mandatory_fields_complete": True,
            "security_claimed": True,
            "security_registered": True,
            "completeness": True,
            "supporting_evidence": True,
            "value_reasonableness": True,
            "calculation_accuracy": True,
            "classification_valid": True,
            "security_documentation": True,
            "transaction_history": True,
            "payment_history": True,
            "filing_timeliness": True,
        }

        self.invalid_claim_data = {
            "mandatory_fields_complete": False,
            "security_claimed": True,
            "security_registered": False,
        }

    def test_apply_hard_rules(self):
        evaluator = ClaimEvaluator(self.invalid_claim_data)
        violations = evaluator.apply_hard_rules()
        self.assertIn("Missing mandatory fields.", violations)
        self.assertIn("Unregistered security claim.", violations)

    def test_calculate_contestability_score(self):
        evaluator = ClaimEvaluator(self.valid_claim_data)
        score = evaluator.calculate_contestability_score()
        self.assertAlmostEqual(score, 1.0)  # Expecting a perfect score

    def test_evaluate(self):
        evaluator = ClaimEvaluator(self.invalid_claim_data)
        result = evaluator.evaluate()
        self.assertEqual(result["recommendation"], "Contest")
        self.assertEqual(result["rule_type"], "Hard Rule Violation")

        evaluator = ClaimEvaluator(self.valid_claim_data)
        result = evaluator.evaluate()
        self.assertEqual(result["recommendation"], "Accept")

if __name__ == "__main__":
    unittest.main()
