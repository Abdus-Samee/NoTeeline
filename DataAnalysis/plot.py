import matplotlib.pyplot as plt

# Sample data: Dictionary where keys are person IDs and values are lists of time intervals
data = {
    1: [(10, 20), (30, 50), (60, 80)],  # For person ID 1, time intervals are (10, 20), (30, 50), and (60, 80)
    2: [(15, 25), (40, 60), (70, 90)],  # For person ID 2, time intervals are (15, 25), (40, 60), and (70, 90)
    3: [(5, 15), (35, 55), (65, 85)]    # For person ID 3, time intervals are (5, 15), (35, 55), and (65, 85)
}

# Plotting
plt.figure(figsize=(10, 6))  # Adjust the figure size as needed

for person_id, intervals in data.items():
    for interval in intervals:
        start, end = interval
        plt.barh(person_id, width=end-start, left=start, height=0.1, color='#4338CA')

plt.xlabel('Time')
plt.ylabel('Person ID')
plt.title('Time Intervals for Person IDs')
plt.yticks(list(data.keys()), ['Person {}'.format(pid) for pid in data.keys()])

plt.show()
