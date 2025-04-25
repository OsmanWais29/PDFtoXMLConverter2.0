class ClaimEvaluator:
    def __init__(self, claim_data):
        self.claim_data = claim_data
        self.scores = {
            "documentation": 0,
            "financial": 0,
            "legal": 0,
            "historical": 0,
            "timing": 0,
        }

    def apply_hard_rules(self):
        # Check for hard rule violations
        violations = []
        if not self.claim_data.get("mandatory_fields_complete"):
            violations.append("Missing mandatory fields.")
        if self.claim_data.get("security_claimed") and not self.claim_data.get("security_registered"):
            violations.append("Unregistered security claim.")
        return violations

    def evaluate_documentation_quality(self):
        # Evaluate documentation quality
        score = 0
        if self.claim_data.get("completeness"):
            score += 10
        if self.claim_data.get("supporting_evidence"):
            score += 10
        return score / 25  # Normalize to 0-1 scale

    def evaluate_financial_aspects(self):
        # Evaluate financial aspects
        score = 0
        if self.claim_data.get("value_reasonableness"):
            score += 10
        if self.claim_data.get("calculation_accuracy"):
            score += 5
        return score / 30  # Normalize to 0-1 scale

    def evaluate_legal_position(self):
        # Evaluate legal position
        score = 0
        if self.claim_data.get("classification_valid"):
            score += 10
        if self.claim_data.get("security_documentation"):
            score += 10
        return score / 20  # Normalize to 0-1 scale

    def evaluate_historical_relationship(self):
        # Evaluate historical relationship
        score = 0
        if self.claim_data.get("transaction_history"):
            score += 10
        if self.claim_data.get("payment_history"):
            score += 10
        return score / 15  # Normalize to 0-1 scale

    def evaluate_claim_timing(self):
        # Evaluate claim timing
        score = 0
        if self.claim_data.get("filing_timeliness"):
            score += 10
        return score / 10  # Normalize to 0-1 scale

    def calculate_contestability_score(self):
        # Calculate the overall contestability score
        self.scores["documentation"] = self.evaluate_documentation_quality()
        self.scores["financial"] = self.evaluate_financial_aspects()
        self.scores["legal"] = self.evaluate_legal_position()
        self.scores["historical"] = self.evaluate_historical_relationship()
        self.scores["timing"] = self.evaluate_claim_timing()

        total_score = (
            self.scores["documentation"] * 0.25 +
            self.scores["financial"] * 0.30 +
            self.scores["legal"] * 0.20 +
            self.scores["historical"] * 0.15 +
            self.scores["timing"] * 0.10
        )
        return total_score

    def evaluate(self):
        # Main evaluation method
        hard_rule_failures = self.apply_hard_rules()
        if hard_rule_failures:
            return {
                "score": 1.0,
                "recommendation": "Contest",
                "reasons": hard_rule_failures,
                "rule_type": "Hard Rule Violation"
            }

        total_score = self.calculate_contestability_score()
        recommendation = self.get_recommendation_for_score(total_score)
        return {
            "score": total_score,
            "recommendation": recommendation,
            "category_scores": self.scores
        }

    def get_recommendation_for_score(self, score):
        # Determine recommendation based on score
        if score <= 0.25:
            return "Accept"
        elif score <= 0.40:
            return "Accept with Notes"
        elif score <= 0.55:
            return "Request Additional Information"
        elif score <= 0.70:
            return "Detailed Review & Negotiation"
        elif score <= 0.85:
            return "Contest with Specific Objections"
        else:
            return "Contest with Multiple Objections"
