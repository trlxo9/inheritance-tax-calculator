from pprint import pprint


from utils._helpers import (
    get_residential_nil_rate_bands,
    get_taxable_estate,
    get_plus_pets_when_estate_plus_pets_is_less_than_exemptions,
    get_total_estate_passing_to_beneficiaries,
    get_total_estate_passing_to_beneficiaries,
    get_record_type,
    get_testcase,
)

from utils.get_estate_value import get_estate_value


from tests.cases import test_cases

crm_record = get_testcase(test_cases, "Ravi Sumoreeah")


def potential_inheritance_tax_liability(
    crm_record, inheritance_tax_rate=0, charity_donation=0
):

    record_type = get_record_type(crm_record)

    estate_value = get_estate_value(crm_record, record_type)

    base_estate_for_rnrb_purposes = estate_value["total_assets"]

    less_money_going_to_charity = (
        base_estate_for_rnrb_purposes * charity_donation // 100
    )

    # TODO move nil rate to constant 32500000
    print(f"record_type: {record_type}")
    total = estate_value["gifts_made_still_in_estate_clts"]["total"]
    print(f"estate_value: {total}")
    less_available_nil_rate_bands_less_clts = (
        65000000 - estate_value["gifts_made_still_in_estate_clts"]["total"]
        if record_type == "joint"
        else 32500000 - estate_value["gifts_made_still_in_estate_clts"]["total"]
    )

    less_residential_nil_rate_bands = get_residential_nil_rate_bands(
        estate_value["total_assets"]
    )

    plus_gifts_made_less_pets = estate_value["gifts_made_still_in_estate_pets"]["total"]

    taxable_estate = get_taxable_estate(
        base_estate_for_rnrb_purposes,
        less_available_nil_rate_bands_less_clts,
        less_residential_nil_rate_bands,
        plus_gifts_made_less_pets,
    )

    #! constant tax band? or apply applicable tax band
    inheritance_tax = taxable_estate * inheritance_tax_rate // 100

    estate_after_tax = taxable_estate - inheritance_tax

    plus_assets_outside_estate = estate_value["assets_outside_of_estate"]["total"]

    plus_life_cover_policies_outside_estate = estate_value[
        "life_cover_policies_outside_of_estate"
    ]["total"]

    plus_pets_when_estate_plus_pets_is_less_than_exemptions = (
        get_plus_pets_when_estate_plus_pets_is_less_than_exemptions(
            base_estate_for_rnrb_purposes,
            less_available_nil_rate_bands_less_clts,
            less_residential_nil_rate_bands,
            plus_gifts_made_less_pets,
            taxable_estate,
        )
    )

    plus_gifts_made_less_clts = estate_value["gifts_made_still_in_estate_clts"]["total"]

    plus_available_nil_rate_bands_less_clts = less_available_nil_rate_bands_less_clts

    plus_residential_nil_rate_bands = less_residential_nil_rate_bands

    total_estate_passing_to_beneficiaries_ex_pensions = (
        get_total_estate_passing_to_beneficiaries(
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
        )
    )

    plus_pension_assets = estate_value["pension_assets"]["total"]

    total_estate_passing_to_beneficiaries_inc_pensions = (
        total_estate_passing_to_beneficiaries_ex_pensions + plus_pension_assets
    )

    return {
        "base_estate_for_rnrb_purposes": base_estate_for_rnrb_purposes,
        "less_money_going_to_charity": less_money_going_to_charity,
        "less_available_nil_rate_bands_less_clts": less_available_nil_rate_bands_less_clts,
        "less_residential_nil_rate_bands": less_residential_nil_rate_bands,
        "plus_gifts_made_less_pets": plus_gifts_made_less_pets,
        "taxable_estate": taxable_estate,
        "inheritance_tax": inheritance_tax,
        "estate_after_tax": estate_after_tax,
        "plus_assets_outside_estate": plus_assets_outside_estate,
        "plus_life_cover_policies_outside_estate": plus_life_cover_policies_outside_estate,
        "plus_pets_when_estate_plus_pets_is_less_than_exemptions": plus_pets_when_estate_plus_pets_is_less_than_exemptions,
        "plus_gifts_made_less_clts": plus_gifts_made_less_clts,
        "plus_available_nil_rate_bands_less_clts": plus_available_nil_rate_bands_less_clts,
        "plus_residential_nil_rate_bands": plus_residential_nil_rate_bands,
        "total_estate_passing_to_beneficiaries_ex_pensions": total_estate_passing_to_beneficiaries_ex_pensions,
        "plus_pension_assets": plus_pension_assets,
        "total_estate_passing_to_beneficiaries_inc_pensions": total_estate_passing_to_beneficiaries_inc_pensions,
    }
