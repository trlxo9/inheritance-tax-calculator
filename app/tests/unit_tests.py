import os
import sys
import json

# from pprint import pprint

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import unittest
from utils.logger import get_logger
from index import potential_inheritance_tax_liability
from tests.cases import test_cases


class TestPotentialInheritanceTaxLiability(unittest.TestCase):
    # initialise logger
    logger = get_logger(__name__)

    def test_potential_inheritance_tax_liability(self):
        for i, test_case in enumerate(test_cases):
            crm_record = test_case["crm_record"]
            inheritance_tax_rate = test_case["inheritance_tax_rate"]
            charity_donation = test_case["charity_donation"]
            result = potential_inheritance_tax_liability(
                crm_record, inheritance_tax_rate, charity_donation
            )
            expected_result = test_case["expected_result"]
            try:
                self.assertEqual(result, expected_result)
                self.logger.info(f"Test case {i} passed.")
            except AssertionError:
                self.logger.error(f"Test case {i} failed.")
                self.logger.error("Expected:")
                print(json.dumps(expected_result, indent=4))
                self.logger.error("Got:")
                print(json.dumps(result, indent=4))


if __name__ == "__main__":
    unittest.main()
