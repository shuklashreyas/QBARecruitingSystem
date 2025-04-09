import pandas as pd
import matplotlib.pyplot as plt

# Load predictions
df = pd.read_csv("bulk_predictions.csv")

# Plot histogram
plt.figure(figsize=(10, 6))
plt.hist(df["score"], bins=20, color="skyblue", edgecolor="black")
plt.title("Distribution of Resume-Job Match Scores")
plt.xlabel("Score")
plt.ylabel("Frequency")
plt.grid(True)
plt.tight_layout()
plt.show()
