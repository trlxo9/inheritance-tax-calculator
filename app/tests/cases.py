case0 = {
    "client1": {
        "name": "Ravi Sumoreeah",
    },
    "client2": {
        "name": "Kerri Sumoreeah",
    },
    "joint_assets_and_investments": [
        {"asset": "Main Residence", "value": 150000000},
        {"asset": "Care Home - Bannow", "value": 150000000},
        {"asset": "Care Home - Beaumont", "value": 150000000},
        {"asset": "Care Home - Seaway", "value": 150000000},
        {"asset": "Care Home - Adelaide", "value": 350000000},
        {"asset": "Care Home - Glottenham", "value": 400000000},
        {"asset": "Deposit Account", "value": 3000000},
    ],
    "client1_assets_and_investments": [],
    "client2_assets_and_investments": [],
    "joint_debts_and_mortgages": [],
    "client1_debts_and_mortgages": [],
    "client2_debts_and_mortgages": [],
    "gifts_made_still_in_estate_clts": [],
    "gifts_made_still_in_estate_pets": [],
    "assets_outside_of_estate": [],
    "life_cover_policies_outside_of_estate": [
        {
            "protection": {
                "provider": "Aviva",
                "policy": "20 Year Term Assurance",
                "end_date": "10/01/2027",
                "policy_number": "6920367EM",
            },
            "owner": "Joint",
            "value": 64175000,
        },
        {
            "protection": {
                "provider": "Aviva",
                "policy": "20 Year Term Assurance",
                "end_date": "10/01/2027",
                "policy_number": "6943063ED",
            },
            "owner": "Ravi",
            "value": 64175000,
        },
    ],
    "pension_assets": [
        {
            "provider": "SJP",
            "policy": "Retirement Account",
            "policy_number": "RA06618805",
            "owner": "Ravi",
            "value": 41625200,
        },
        {
            "provider": "SJP",
            "policy": "Retirement Account",
            "policy_number": "RA06618672",
            "owner": "Kerri",
            "value": 41833600,
        },
    ],
    "income_and_expenditure": {
        "client1": {
            "income": [
                {"type": "Salary", "value": 18000000},
            ],
            "expenditure": [
                {"type": "Essential", "value": 180000},
                {"type": "Discretionary", "value": 300000},
            ],
        },
        "client2": {
            "income": [
                {"type": "Salary", "value": 3000000},
            ],
            "expenditure": [],
        },
    },
}
case0_expected_result = {
    "base_estate_for_rnrb_purposes": 1353000000,
    "less_money_going_to_charity": 000,
    "less_available_nil_rate_bands_less_clts": 65000000,
    "less_residential_nil_rate_bands": 0,
    "plus_gifts_made_less_pets": 0,
    "taxable_estate": 1288000000,
    "inheritance_tax": 515200000,
    "estate_after_tax": 772800000,
    "plus_assets_outside_estate": 0,
    "plus_life_cover_policies_outside_estate": 128350000,
    "plus_pets_when_estate_plus_pets_is_less_than_exemptions": 0,
    "plus_gifts_made_less_clts": 0,
    "plus_available_nil_rate_bands_less_clts": 65000000,
    "plus_residential_nil_rate_bands": 0,
    "total_estate_passing_to_beneficiaries_ex_pensions": 966150000,
    "plus_pension_assets": 83458800,
    "total_estate_passing_to_beneficiaries_inc_pensions": 1049608800,
}
case1 = {
    "client1": {
        "name": "Rachel Long",
    },
    "joint_assets_and_investments": [],
    "client1_assets_and_investments": [
        {"asset": "Cash Account - Leeds BS", "value": 2000000},
        {
            "asset": "Main Residence - total value £700,000 - owns 50%",
            "value": 35000000,
        },
        {"asset": "SJP ISA23583628", "value": 4113800},
    ],
    "client2_assets_and_investments": [],
    "joint_debts_and_mortgages": [],
    "client1_debts_and_mortgages": [
        {
            "debts_and_mortgages": "Santander 5.5% - total amount £400k but pays 50%",
            "value": 20000000,
        },
    ],
    "client2_debts_and_mortgages": [],
    "gifts_made_still_in_estate_clts": [],
    "gifts_made_still_in_estate_pets": [],
    "assets_outside_of_estate": [],
    "life_cover_policies_outside_of_estate": [],
    "pension_assets": [
        {
            "provider": "RA",
            "policy": "SJP",
            "owner": "Rachel Long",
            "value": 16692658,
        },
        {
            "provider": "Aviva",
            "policy": "work Pension",
            "owner": "Rachel Long",
            "value": 700000,
        },
    ],
    "income_and_expenditure": {
        "client1": {
            "income": [
                {"type": "Employment", "value": 4000000},
            ],
            "expenditure": [
                {"type": "Essential", "value": 50000},
                {"type": "Discretionary", "value": 55000},
                {"type": "Mortgage", "value": 90000},
            ],
        },
        "client2": {
            "income": [],
            "expenditure": [],
        },
    },
}
case1_expected_result = {
    "base_estate_for_rnrb_purposes": 21113800,
    "less_money_going_to_charity": 0,
    "less_available_nil_rate_bands_less_clts": 32500000,
    "less_residential_nil_rate_bands": 0,
    "plus_gifts_made_less_pets": 0,
    "taxable_estate": 0,
    "inheritance_tax": 0,
    "estate_after_tax": 0,
    "plus_assets_outside_estate": 0,
    "plus_life_cover_policies_outside_estate": 0,
    "plus_pets_when_estate_plus_pets_is_less_than_exemptions": 0,
    "plus_gifts_made_less_clts": 0,
    "plus_available_nil_rate_bands_less_clts": 32500000,
    "plus_residential_nil_rate_bands": 0,
    "total_estate_passing_to_beneficiaries_ex_pensions": 32500000,
    "plus_pension_assets": 17392700,
    "total_estate_passing_to_beneficiaries_inc_pensions": 49892700,
}
case2 = {
    "client1": {
        "name": "Sue Cox",
    },
    "joint_assets_and_investments": [],
    "client1_assets_and_investments": [
        {"asset": "Main Residence", "value": 85000000},
        {"asset": "Menorca Property", "value": 18000000},
        {"asset": "Schroders (Cazenove) Portfolio", "value": 232113268},
        {"asset": "Bank & Savings Accounts", "value": 10304200},
        {"asset": "Premium Bonds", "value": 5000000},
        {"asset": "Saga Shares - 1113", "value": 154484},
        {"asset": "Banca March Euro Acct E1", "value": 944000},
        {"asset": "Fixed Rate Bonds - Coventry/Aldemore/Paragon", "value": 18868072},
        {
            "asset": "SJP Bond (Loan Plan) Outstanding Loan IB26013359",
            "value": 20000000,
        },
        {
            "asset": "SJP Bond (Loan Plan) Outstanding Loan IB26065847",
            "value": 20000000,
        },
        {
            "asset": "SJP Bond (Loan Plan) Outstanding Loan IB67604306",
            "value": 42500000,
        },
    ],
    "client2_assets_and_investments": [],
    "joint_debts_and_mortgages": [],
    "client1_debts_and_mortgages": [],
    "client2_debts_and_mortgages": [],
    "gifts_made_still_in_estate_clts": [
        {
            "gift": "SJP Bond (Gift Plan - VDT) IB26012815",
            "date_outside": "Nov-27",
            "value": 10000000,
        },
        {
            "gift": "SJP Bond (Gift Plan - VDT) IB25339144",
            "date_outside": "Mar-27",
            "value": 20000000,
        },
    ],
    "gifts_made_still_in_estate_pets": [
        {
            "gift": "SJP Bond (Gift Plan -Absolute) IB67557041",
            "date_outside": "Feb-23",
            "value": 10000000,
        },
        {
            "gift": "SJP Bond (Gift Plan -Absolute) IB67772657",
            "date_outside": "Feb-24",
            "value": 10000000,
        },
        {
            "gift": "Cash Gift to Michael Cox - Dec 17",
            "date_outside": "Dec-24",
            "value": 2000000,
        },
        {
            "gift": "Investment Flat to Jason & Michael",
            "date_outside": "2027/28",
            "value": 40000000,
        },
    ],
    "assets_outside_of_estate": [
        {
            "asset": "Ingenious Greenlight Media 2016/2017 EIS Fund (held for over 2 years)",
            "value": 504300,
        },
        {
            "asset": "Ingenious Renewable Energy 2014/2015 EIS (held for over 2 years)",
            "value": 28000,
        },
        {"asset": "SJP DGP IB67906586 (was 45C05G12) - Whole Fund", "value": 10176600},
        {"asset": "Growth on SJP Gift Plan (VDT) IB25339144", "value": 4973300},
        {
            "asset": "Growth on SJP Gift Plan(VDT) IB26012815 (since date of trust)",
            "value": 617700,
        },
        {
            "asset": "SJP Gift Plan (VDT) IB67146449 (was 13J76T89) - Whole fund",
            "value": 16488000,
        },
        {"asset": "Growth on SJP Gift Plan (Absolute) IB67557041", "value": 3633400},
        {"asset": "Growth on SJP Gift Plan (Absolute) IB67772657", "value": 1597400},
        {
            "asset": "SJP Gift Plan (VDT) IB68859875 (was 99C84D70) - Whole fund",
            "value": 13594800,
        },
        {
            "asset": "SJP Gift Plan (VDT) IB68859925 (was 99C84H99) - Whole Fund",
            "value": 13794600,
        },
        {"asset": "Growth on SJP Loan Plan 2 IB26013359", "value": 1235500},
        {"asset": "Growth on SJP Loan Plan 3 IB26065847", "value": 1173500},
        {"asset": "Growth on SJP Loan Plan IB67604306", "value": 26506200},
    ],
    "life_cover_policies_outside_of_estate": [],
    "pension_assets": [],
    "income_and_expenditure": {
        "client1": {
            "income": [
                {"type": "Company Pension", "value": 9998000},
                {"type": "State Pension", "value": 1000000},
                {"type": "DGP Income", "value": 500000},
            ],
            "expenditure": [
                {"type": "Essential", "value": 50000},
                {"type": "Discretionary", "value": 150000},
            ],
        },
        "client2": {
            "income": [],
            "expenditure": [],
        },
    },
}
case2_expected_result = {
    "base_estate_for_rnrb_purposes": 452884024,
    "less_money_going_to_charity": 45288402,
    "less_available_nil_rate_bands_less_clts": 2500000,
    "less_residential_nil_rate_bands": 0,
    "plus_gifts_made_less_pets": 62000000,
    "taxable_estate": 512384024,
    "inheritance_tax": 184458249,
    "estate_after_tax": 327925775,
    "plus_assets_outside_estate": 94323300,
    "plus_life_cover_policies_outside_estate": 0,
    "plus_pets_when_estate_plus_pets_is_less_than_exemptions": 0,
    "plus_gifts_made_less_clts": 30000000,
    "plus_available_nil_rate_bands_less_clts": 2500000,
    "plus_residential_nil_rate_bands": 0,
    "total_estate_passing_to_beneficiaries_ex_pensions": 454749075,
    "plus_pension_assets": 0,
    "total_estate_passing_to_beneficiaries_inc_pensions": 454749075,
}
case3 = {
    "client1": {
        "name": "Rod Maynard",
    },
    "client2": {
        "name": "Sally Maynard",
    },
    "joint_assets_and_investments": [
        {"asset": "Main Residence", "value": 150000000},
        {"asset": "Natwest - Current Account", "value": 8500000},
        {"asset": "Natwest - Current Account", "value": 3000000},
    ],
    "client1_assets_and_investments": [
        {"asset": "SJP - ISA - ISA23986748", "value": 11362764},
        {"asset": "Natwest - Deposit Account", "value": 15000000},
    ],
    "client2_assets_and_investments": [
        {"asset": "SJP - ISA - ISA23986813", "value": 11362791},
        {"asset": "Hodge Equity Release - Current Account", "value": 6400000},
        {"asset": "Santander - Current Account", "value": 10000000},
        {"asset": "Current Account", "value": 2300000},
    ],
    "joint_debts_and_mortgages": [],
    "client1_debts_and_mortgages": [],
    "client2_debts_and_mortgages": [],
    "gifts_made_still_in_estate_clts": [],
    "gifts_made_still_in_estate_pets": [],
    "assets_outside_of_estate": [
        {
            "asset": "The Mr R F & Mrs S A Maynard & Trustee Loan Trust - IB68733591",
            "value": 37807100,
        },
        {
            "asset": "The Mr R F & Mrs S A Maynard Discounted Gift Trust - IB68733690",
            "value": 10760480,
        },
        {
            "asset": "The Mr R F & Mrs S A Maynard Discounted Gift Trust - IB68733641",
            "value": 594522,
        },
    ],
    "life_cover_policies_outside_of_estate": [],
    "pension_assets": [
        {
            "provider": "SJP",
            "policy": "Retirement Account",
            "policy_number": "RA04075156",
            "owner": "Rod",
            "value": 16998000,
        }
    ],
    "income_and_expenditure": {
        "client1": {
            "income": [
                {"type": "SJP RA Drawdown", "frequency": "Annually", "value": 3280000},
                {"type": "State Pension", "frequency": "Annually", "value": 1133300},
                {"type": "Income from Trust", "frequency": "Annually", "value": 600000},
                {"type": "Income from Trust", "frequency": "Annually", "value": 250000},
            ],
            "expenditure": [
                {"type": "Essential", "frequency": "Monthly", "value": 110000},
                {"type": "Discretionary", "frequency": "Monthly", "value": 130000},
                {"type": "Sports/Hobbies", "frequency": "Annually", "value": 600000},
                {"type": "Holidays", "frequency": "Annually", "value": 1500000},
            ],
        },
        "client2": {
            "income": [
                {"type": "State Pension", "frequency": "Annually", "value": 818700},
                {"type": "Income from Trust", "frequency": "Annually", "value": 600000},
                {"type": "Income from Trust", "frequency": "Annually", "value": 250000},
            ],
            "expenditure": [
                {"type": "Essential", "frequency": "Monthly", "value": 110000},
                {"type": "Discretionary", "frequency": "Monthly", "value": 130000},
                {"type": "Sports/Hobbies", "frequency": "Annually", "value": 600000},
                {"type": "Holidays", "frequency": "Annually", "value": 1500000},
            ],
        },
    },
}
case3_expected_result = {
    "base_estate_for_rnrb_purposes": 217925555,
    "less_money_going_to_charity": 0,
    "less_available_nil_rate_bands_less_clts": 65000000,
    "less_residential_nil_rate_bands": 26037223,
    "plus_gifts_made_less_pets": 0,
    "taxable_estate": 126888333,
    "inheritance_tax": 50755333,
    "estate_after_tax": 76133000,
    "plus_assets_outside_estate": 49162102,
    "plus_life_cover_policies_outside_estate": 0,
    "plus_pets_when_estate_plus_pets_is_less_than_exemptions": 0,
    "plus_gifts_made_less_clts": 0,
    "plus_available_nil_rate_bands_less_clts": 65000000,
    "plus_residential_nil_rate_bands": 26037223,
    "total_estate_passing_to_beneficiaries_ex_pensions": 216332324,
    "plus_pension_assets": 16997979,
    "total_estate_passing_to_beneficiaries_inc_pensions": 233330303,
}
case4 = {
    "client1": {
        "name": "Julie Tomlinson",
    },
    "joint_assets_and_investments": [],
    "client1_assets_and_investments": [
        {"asset": "Main Residence", "value": 72500000},
        {"asset": "Santander 123 Current Account", "value": 6000000},
    ],
    "client2_assets_and_investments": [],
    "joint_debts_and_mortgages": [],
    "client1_debts_and_mortgages": [],
    "client2_debts_and_mortgages": [],
    "gifts_made_still_in_estate_clts": [],
    "gifts_made_still_in_estate_pets": [],
    "assets_outside_of_estate": [],
    "life_cover_policies_outside_of_estate": [],
    "pension_assets": [
        {
            "provider": "SJP",
            "policy": "Retirement Account",
            "policy_number": "RA06898787",
            "owner": "Julie Tomlinson",
            "value": 20477100,
        },
        {
            "provider": "Aviva",
            "policy": "Stakeholder Pension",
            "policy_number": "Not specified",
            "owner": "Julie Tomlinson",
            "value": 1700000,
        },
        {
            "provider": "NEST",
            "policy": "Current Employer Scheme",
            "policy_number": "Not specified",
            "owner": "Julie Tomlinson",
            "value": 1200000,
        },
    ],
    "income_and_expenditure": {
        "client1": {
            "income": [
                {
                    "type": "Salary - Sales Manager at Kalcep",
                    "frequency": "Annually",
                    "value": 600000,
                },
                {"type": "Income from club", "frequency": "Annually", "value": 2400000},
            ],
            "expenditure": [
                {"type": "Essential", "frequency": "Monthly", "value": 100000},
                {"type": "Discretionary", "frequency": "Monthly", "value": 100000},
            ],
        },
        "client2": {"income": [], "expenditure": []},
    },
}
case4_expected_result = {
    "base_estate_for_rnrb_purposes": 78500000,
    "less_money_going_to_charity": 0,
    "less_available_nil_rate_bands_less_clts": 32500000,
    "less_residential_nil_rate_bands": 17500000,
    "plus_gifts_made_less_pets": 0,
    "taxable_estate": 28500000,
    "inheritance_tax": 11400000,
    "estate_after_tax": 17100000,
    "plus_assets_outside_estate": 0,
    "plus_life_cover_policies_outside_estate": 0,
    "plus_pets_when_estate_plus_pets_is_less_than_exemptions": 0,
    "plus_gifts_made_less_clts": 0,
    "plus_available_nil_rate_bands_less_clts": 32500000,
    "plus_residential_nil_rate_bands": 17500000,
    "total_estate_passing_to_beneficiaries_ex_pensions": 67100000,
    "plus_pension_assets": 23377100,
    "total_estate_passing_to_beneficiaries_inc_pensions": 90477100,
}
case5 = {
    "client1": {
        "name": "Elizabeth Bunce ",
    },
    "joint_assets_and_investments": [],
    "client1_assets_and_investments": [
        {"asset": "SJP - ISA - ISA02434421", "value": 10092780},
        {"asset": "SJP - Unit Trust - UT02434488", "value": 12069769},
        {
            "asset": "The Mrs E J Bunce & Trustees Loan Trust - IB68305804",
            "value": 20000000,
        },
        {"asset": "Main Residence", "value": 120000000},
        {"asset": "Barclays - Deposit Account", "value": 9000000},
        {"asset": "Santander - Deposit Account", "value": 2100000},
        {"asset": "Virgin Money - Savings Account", "value": 3000000},
        {"asset": "Tesco - Savings Account", "value": 3000000},
        {"asset": "Barclays - Current Account", "value": 6000000},
    ],
    "client2_assets_and_investments": [],
    "joint_debts_and_mortgages": [],
    "client1_debts_and_mortgages": [],
    "client2_debts_and_mortgages": [],
    "gifts_made_still_in_estate_clts": [
        {
            "gift": "The Elizabeth Jane Bunce Trust - IB24894487",
            "date_outside": "11/13/2026",
            "value": 10000000,
        },
        {
            "gift": "The Elizabeth Jane Bunce Discretionary Trust EGP - IB29855384",
            "date_outside": "4/17/2030",
            "value": 15000000,
        },
    ],
    "gifts_made_still_in_estate_pets": [],
    "assets_outside_of_estate": [
        {
            "asset": "The Mrs E J Bunce Investment Bond Trust - IB67577882",
            "value": 21855365,
        },
        {
            "asset": "The Mrs E J Bunce Investment Bond Trust - IB67577916",
            "value": 3856829,
        },
        {
            "asset": "The Mrs E J Bunce & Trustees Loan Trust - IB68305804",
            "value": 1937729,
        },
        {"asset": "The Elizabeth Jane Bunce Trust - IB24894487", "value": 347023},
        {
            "asset": "The Elizabeth Jane Bunce Discretionary Trust EGP - IB29855384",
            "value": 580912,
        },
    ],
    "life_cover_policies_outside_of_estate": [
        {"protection": "AIG - Whole of Life - P535185305", "value": 15750000}
    ],
    "pension_assets": [],
    "income_and_expenditure": {
        "client1": {
            "income": [
                {"type": "NHS Pension", "frequency": "Annually", "value": 6900000},
                {
                    "type": "GSK Widows Pension",
                    "frequency": "Annually",
                    "value": 3400000,
                },
                {"type": "State Pension", "frequency": "Annually", "value": 800000},
                {"type": "Bank Interest", "frequency": "Annually", "value": 145700},
                {"type": "Dividend Income", "frequency": "Annually", "value": 15700},
            ],
            "expenditure": [
                {"type": "Essential", "frequency": "Monthly", "value": 161200},
                {"type": "Discretionary", "frequency": "Monthly", "value": 203300},
            ],
        },
        "client2": {"income": [], "expenditure": []},
    },
}
case5_expected_result = {
    "base_estate_for_rnrb_purposes": 185262549,
    "less_money_going_to_charity": 0,
    "less_available_nil_rate_bands_less_clts": 40000000,
    "less_residential_nil_rate_bands": 35000000,
    "plus_gifts_made_less_pets": 0,
    "taxable_estate": 110262549,
    "inheritance_tax": 44105020,
    "estate_after_tax": 66157529,
    "plus_assets_outside_estate": 25712194,
    "plus_life_cover_policies_outside_estate": 15750000,
    "plus_pets_when_estate_plus_pets_is_less_than_exemptions": 0,
    "plus_gifts_made_less_clts": 25000000,
    "plus_available_nil_rate_bands_less_clts": 40000000,
    "plus_residential_nil_rate_bands": 35000000,
    "total_estate_passing_to_beneficiaries_ex_pensions": 207619723,
    "plus_pension_assets": 0,
    "total_estate_passing_to_beneficiaries_inc_pensions": 207619723,
}


test_cases = [
    {  # Ravi & Kerri Sumoreeah
        "crm_record": case0,
        "expected_result": case0_expected_result,
        "inheritance_tax_rate": 40,
        "charity_donation": 0,
        "notes": """
    D13 might be missing some values so the total would be £13,530,000
    """,
    },
    {  # Rachel Long
        "crm_record": case1,
        "expected_result": case1_expected_result,
        "inheritance_tax_rate": 40,
        "charity_donation": 0,
        "notes": """
    less_residential_nil_rate_bands is different than text case 1? 
    plus_residential_nil_rate_bands
    """,
    },
    {  # Sue Cox
        "crm_record": case2,
        "expected_result": case2_expected_result,
        "inheritance_tax_rate": 36,
        "charity_donation": 10,
        "notes": """
    the test case is off by 1 pence
    """,
    },
    {  # Rod & Sally Maynard
        "crm_record": case3,
        "expected_result": case3_expected_result,
        "inheritance_tax_rate": 0.4,
        "charity_donation": 0,
        "notes": """
    less_residential_nil_rate_bands is different than text case 1? 
    plus_residential_nil_rate_bands
    """,
    },
    {  # Julie Tomlinson
        "crm_record": case4,
        "expected_result": case4_expected_result,
        "inheritance_tax_rate": 40,
        "charity_donation": 0,
        "notes": """
    less_residential_nil_rate_bands is different than text case 1? 
    plus_residential_nil_rate_bands
    """,
    },
    {  # Elizabeth Bunce
        "crm_record": case5,
        "expected_result": case5_expected_result,
        "inheritance_tax_rate": 40,
        "charity_donation": 0,
        "notes": """
    For example, in case 5 with Elizabeth Bunce, it's hard-coded with a £650k in Cell C73 less the D43 Gifts, not the 325k I was expecting. I thought this related to whether it's a single or joint record, but I'm guessing that something else is at play here. 
    """,
    },
]
