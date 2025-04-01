import pandas as pd

true_df = pd.read_csv('True.csv')
fake_df = pd.read_csv('Fake.csv')

true_df['label'] = [1 for i in range(0, true_df.shape[0])]
fake_df['label'] = [0 for i in range(0, fake_df.shape[0])]

combined_df = pd.concat([true_df, fake_df], ignore_index=True)
combined_df = combined_df.sample(frac=1).reset_index(drop=True)

combined_df.to_csv('Combined.csv', index=False)