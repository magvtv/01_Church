import csv
import random
import string
from datetime import datetime, timedelta

# Generate a random 10-character alphanumeric transaction ID


def generate_transaction_id():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))


# Sample church members from previous JSON dataset
church_members = [
    {"name": "John Mwangi", "member_id": "JM001"},
    {"name": "Grace Kamau", "member_id": "GK002"},
    {"name": "Daniel Ochieng", "member_id": "DO003"},
    {"name": "Elizabeth Mutua", "member_id": "EM004"},
    {"name": "Michael Otieno", "member_id": "MO005"},
    {"name": "Catherine Njeri", "member_id": "CN006"},
    {"name": "Paul Okello", "member_id": "PO007"},
    {"name": "Lucy Wambui", "member_id": "LW008"},
    {"name": "James Karanja", "member_id": "JK009"},
    {"name": "Anne Chebet", "member_id": "AC010"}
]

# Generate random amounts (100 - 10,000 divisible by 10)
amounts = [x for x in range(100, 10001, 10)]

# Generate random phone numbers


def generate_phone_number():
    if random.random() < 0.8:  # 80% Kenyan numbers, 20% US numbers
        return "+2547" + ''.join(random.choices(string.digits, k=7))
    else:
        return "+1" + ''.join(random.choices(string.digits, k=10))

# Generate unique timestamps within the past 90 days


def unique_transaction_date(index):
    base_date = datetime.now() - timedelta(days=random.randint(0, 90))
    random_time_offset = timedelta(hours=random.randint(
        0, 23), minutes=random.randint(0, 59), seconds=index)
    return (base_date + random_time_offset).strftime("%Y-%m-%d %H:%M:%S")


# Create CSV file
csv_filename = "tithe_transactions.csv"

with open(csv_filename, mode="w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["transaction_id", "member_id", "amount",
                    "transaction_date", "sender_phone", "status"])

    for i in range(100):  # Generate 100 dummy records
        member = random.choice(church_members)
        writer.writerow([
            generate_transaction_id(),
            member["member_id"],
            random.choice(amounts),
            unique_transaction_date(i),  # Ensure different timestamps
            generate_phone_number(),
            "confirmed"
        ])

csv_filename
