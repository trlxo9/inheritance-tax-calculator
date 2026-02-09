from pprint import pprint

from utils._helpers import (
    get_assets_and_investments,
    get_debts_and_mortgages,
    get_total_assets,
    get_gifts_made_still_in_estate_clts,
    get_gifts_made_still_in_estate_pets,
    get_assets_outside_of_estate,
    get_life_cover_policies_outside_of_estate,
    get_total_assets_plus_gifts_and_life_cover_policies,
    get_pension_assets,
)


def get_estate_value(crm_record, record_type):

    # initialise variables
    client1_assets_and_investments = {}
    client2_assets_and_investments = {}
    joint_assets_and_investments = {}
    client1_debts_and_mortgages = {}
    client2_debts_and_mortgages = {}
    joint_debts_and_mortgages = {}

    # get client 1 assets and investments
    client1_assets_and_investments = get_assets_and_investments(crm_record, "client1")

    if record_type == "joint":
        # get client 2 assets and investments
        client2_assets_and_investments = get_assets_and_investments(
            crm_record, "client2"
        )

        # get joint assets and investments
        joint_assets_and_investments = get_assets_and_investments(crm_record, "joint")

    #! should other liabilities be included or only debts and mortgages?
    # get client 1 debts and mortgages
    client1_debts_and_mortgages = get_debts_and_mortgages(crm_record, "client1")

    if record_type == "joint":
        # get client 2 debts and mortgages
        client2_debts_and_mortgages = get_debts_and_mortgages(crm_record, "client2")

        # get joint debts and mortgages
        joint_debts_and_mortgages = get_debts_and_mortgages(crm_record, "joint")

    # print(f"\n\n")
    # print(client1_assets_and_investments.get("total", 0))
    # print(client2_assets_and_investments.get("total", 0))
    # print(joint_assets_and_investments.get("total", 0))
    # print(client1_debts_and_mortgages.get("total", 0))
    # print(client2_debts_and_mortgages.get("total", 0))
    # print(joint_debts_and_mortgages.get("total", 0))

    # get total assets
    total_assets = get_total_assets(
        client1_assets_and_investments,
        client2_assets_and_investments,
        joint_assets_and_investments,
        client1_debts_and_mortgages,
        client2_debts_and_mortgages,
        joint_debts_and_mortgages,
    )

    gifts_made_still_in_estate_clts = get_gifts_made_still_in_estate_clts(crm_record)

    gifts_made_still_in_estate_pets = get_gifts_made_still_in_estate_pets(crm_record)

    assets_outside_of_estate = get_assets_outside_of_estate(crm_record)

    life_cover_policies_outside_of_estate = get_life_cover_policies_outside_of_estate(
        crm_record
    )

    total_assets_plus_gifts_and_life_cover_policies = (
        get_total_assets_plus_gifts_and_life_cover_policies(
            total_assets,
            gifts_made_still_in_estate_clts["total"],
            gifts_made_still_in_estate_pets["total"],
            assets_outside_of_estate["total"],
            life_cover_policies_outside_of_estate["total"],
        )
    )

    pension_assets = get_pension_assets(crm_record)

    return {
        "total_assets": total_assets,
        "gifts_made_still_in_estate_clts": gifts_made_still_in_estate_clts,
        "gifts_made_still_in_estate_pets": gifts_made_still_in_estate_pets,
        "assets_outside_of_estate": assets_outside_of_estate,
        "life_cover_policies_outside_of_estate": life_cover_policies_outside_of_estate,
        "total_assets_plus_gifts_and_life_cover_policies": total_assets_plus_gifts_and_life_cover_policies,
        "pension_assets": pension_assets,
    }
