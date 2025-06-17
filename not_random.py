from decimal import Decimal, getcontext
from shutil import disk_usage

getcontext().prec = 100

def generate_number():
    u = disk_usage('.')
    used = Decimal(u.used)
    free = Decimal(u.free)
    total = Decimal(u.total)
    value = (free / used) * total

    # Combine with object id for variability
    entropy = (u.used % 12345) ^ id(object())
    value += Decimal(entropy % 100000)

    digits = str(value).replace('.', '')
    digit_sum = sum(int(d) for d in digits)
    return digit_sum % 100 + 1

for _ in range(10):
    print(generate_number())
