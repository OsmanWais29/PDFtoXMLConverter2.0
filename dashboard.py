def generate_claim_dashboard(claim_evaluation):
    print("┌───────────────────────────────────────────────────────────────┐")
    print("│ Claim Contestability Analysis                                 │")
    print("├───────────────────────────────────────────────────────────────┤")
    print(f"│ Overall Score: {claim_evaluation['score']:.2f} ({claim_evaluation['recommendation']})")
    print("├───────────────────┬───────────────┬───────────────────────────┤")
    print("│ Category          │ Score         │ Key Factors               │")
    print("├───────────────────┼───────────────┼───────────────────────────┤")
    for category, score in claim_evaluation["category_scores"].items():
        print(f"│ {category.capitalize():<17} │ {score:.2f}         │ ...details...          │")
    print("└───────────────────┴───────────────┴───────────────────────────┘")
