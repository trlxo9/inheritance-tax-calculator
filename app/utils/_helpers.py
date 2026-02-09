def get_record_type(crm_record):
    if "client2" in crm_record:
        return "joint"
    else:
        return "single"


def get_assets_and_investments(crm_record, client):

    if client == "joint":
        assets_and_investments = crm_record.get("joint_assets_and_investments", [])

    elif client == "client1":
        assets_and_investments = crm_record.get("client1_assets_and_investments", [])

    else:
        assets_and_investments = crm_record.get("client2_assets_and_investments", [])

    # sum value for total
    def sum_values(assets_and_investments):
        return sum(asset["value"] for asset in assets_and_investments)

    return {
        "assets_and_investments": assets_and_investments,
        "total": sum_values(assets_and_investments),
    }


def get_debts_and_mortgages(crm_record, client):

    if client == "joint":
        debts_and_mortgages = crm_record.get("joint_debts_and_mortgages", [])

    elif client == "client1":
        debts_and_mortgages = crm_record.get("client1_debts_and_mortgages", [])

    else:
        debts_and_mortgages = crm_record.get("client2_debts_and_mortgages", [])

    # sum value for total
    def sum_values(debts_and_mortgages):
        return sum(debt["value"] for debt in debts_and_mortgages)

    return {
        "debts_and_mortgages": debts_and_mortgages,
        "total": sum_values(debts_and_mortgages),
    }


def get_total_assets(
    client1_assets_and_investments,
    client2_assets_and_investments,
    joint_assets_and_investments,
    client1_debts_and_mortgages,
    client2_debts_and_mortgages,
    joint_debts_and_mortgages,
):
    return (
        client1_assets_and_investments.get("total", 0)
        - client1_debts_and_mortgages.get("total", 0)
        + client2_assets_and_investments.get("total", 0)
        - client2_debts_and_mortgages.get("total", 0)
        + joint_assets_and_investments.get("total", 0)
        - joint_debts_and_mortgages.get("total", 0)
    )


def get_gifts_made_still_in_estate_clts(crm_record):

    # get details from dcjson
    gifts_made = crm_record.get("gifts_made_still_in_estate_clts", [])

    # sum value for total
    def sum_values(gifts):
        return sum(gift["value"] for gift in gifts)

    return {
        "gifts_made": gifts_made,
        "total": sum_values(gifts_made),
    }


def get_gifts_made_still_in_estate_pets(crm_record):

    # get details from dcjson
    gifts_made = crm_record.get("gifts_made_still_in_estate_pets", [])

    # sum value for total
    def sum_values(gifts):
        return sum(gift["value"] for gift in gifts)

    return {
        "gifts_made": gifts_made,
        "total": sum_values(gifts_made),
    }


def get_assets_outside_of_estate(crm_record):
    # get details from dcjson
    assets = crm_record.get("assets_outside_of_estate", [])

    # sum value for total
    def sum_values(assets):
        return sum(asset["value"] for asset in assets)

    return {
        "assets": assets,
        "total": sum_values(assets),
    }


def get_life_cover_policies_outside_of_estate(crm_record):
    # get details from dcjson
    protections = crm_record.get("life_cover_policies_outside_of_estate", [])

    # sum value for total
    def sum_values(protections):
        return sum(protection["value"] for protection in protections)

    return {
        "protections": protections,
        "total": sum_values(protections),
    }


def get_total_assets_plus_gifts_and_life_cover_policies(
    total_assets,
    gifts_made_still_in_estate_clts,
    gifts_made_still_in_estate_pets,
    assets_outside_of_estate,
    life_cover_policies_outside_of_estate,
):
    return round(
        total_assets
        + gifts_made_still_in_estate_clts
        + gifts_made_still_in_estate_pets
        + assets_outside_of_estate
        + life_cover_policies_outside_of_estate,
        2,
    )


def get_pension_assets(crm_record):
    # get details from dcjson
    pensions = crm_record.get("pension_assets", [])

    # sum value for total
    def sum_values(pensions):
        return sum(pension["value"] for pension in pensions)

    return {
        "protections": pensions,
        "total": sum_values(pensions),
    }


# TODO get source of these constants
def get_residential_nil_rate_bands(total_assets):

    if total_assets > 2000000:
        if total_assets > 2700000:
            result = 0
        else:
            result = 350000 - ((total_assets - 2000000) / 2)
    else:
        result = 350000

    return round(result, 2)


def get_taxable_estate(
    base_estate_for_rnrb_purposes,
    less_available_nil_rate_bands_less_clts,
    less_residential_nil_rate_bands,
    plus_gifts_made_less_pets,
):
    if (
        base_estate_for_rnrb_purposes
        - (less_available_nil_rate_bands_less_clts + less_residential_nil_rate_bands)
        < 0
    ):
        if (base_estate_for_rnrb_purposes + plus_gifts_made_less_pets) < (
            less_available_nil_rate_bands_less_clts + less_residential_nil_rate_bands
        ):
            result = 0
        else:
            result = (
                base_estate_for_rnrb_purposes
                - less_available_nil_rate_bands_less_clts
                - less_residential_nil_rate_bands
                + plus_gifts_made_less_pets
            )
    else:
        result = (
            base_estate_for_rnrb_purposes
            - less_available_nil_rate_bands_less_clts
            - less_residential_nil_rate_bands
            + plus_gifts_made_less_pets
        )

    return result


def get_plus_pets_when_estate_plus_pets_is_less_than_exemptions(
    base_estate_for_rnrb_purposes,
    less_available_nil_rate_bands_less_clts,
    less_residential_nil_rate_bands,
    plus_gifts_made_less_pets,
    taxable_estate,
):
    if (
        base_estate_for_rnrb_purposes + plus_gifts_made_less_pets
        == less_residential_nil_rate_bands + less_available_nil_rate_bands_less_clts
    ):
        result = 0
    elif taxable_estate == 0:
        result = plus_gifts_made_less_pets
    else:
        result = 0

    return result


def get_total_estate_passing_to_beneficiaries(
    estate_value,
    less_available_nil_rate_bands_less_clts,
    less_residential_nil_rate_bands,
    base_estate_for_rnrb_purposes,
    estate_after_tax,
    plus_assets_outside_estate,
    plus_life_cover_policies_outside_estate,
    plus_pets_when_estate_plus_pets_is_less_than_exemptions,
    plus_gifts_made_less_clts,
    plus_available_nil_rate_bands_less_clts,
    plus_residential_nil_rate_bands,
):

    if (
        estate_value["total_assets"]
        + estate_value["gifts_made_still_in_estate_pets"]["total"]
        < less_available_nil_rate_bands_less_clts + less_residential_nil_rate_bands
    ):
        result = base_estate_for_rnrb_purposes + sum(
            [
                estate_after_tax,
                plus_assets_outside_estate,
                plus_life_cover_policies_outside_estate,
                plus_pets_when_estate_plus_pets_is_less_than_exemptions,
                plus_gifts_made_less_clts,
            ]
        )
    else:
        result = sum(
            [
                estate_after_tax,
                plus_assets_outside_estate,
                plus_life_cover_policies_outside_estate,
                plus_pets_when_estate_plus_pets_is_less_than_exemptions,
                plus_gifts_made_less_clts,
                plus_available_nil_rate_bands_less_clts,
                plus_residential_nil_rate_bands,
            ]
        )

    return result


def get_testcase(test_cases, client_name):
    for test_case in test_cases:
        crm_record = test_case["crm_record"]
        if (
            crm_record["client1"]["name"] == client_name
            or crm_record["client2"]["name"] == client_name
        ):
            return test_case
