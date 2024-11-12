import pytest
import st
import st.api.default.get_schedules
import st.api.default.post_register
import st.models.registration_credentials

import utils


@pytest.mark.asyncio
async def test_create_account_and_login():
    email, password = utils.random_creds()

    client = utils.create_client()
    await st.api.default.post_register.asyncio(
        client=client,
        body=st.models.registration_credentials.RegistrationCredentials(
            username="Test User",
            email=email,
            password=password,
        ),
    )
    client = await utils.create_authed_client(email=email, password=password)

    schedules = await st.api.default.get_schedules.asyncio(client=client)
    assert schedules is not None


@pytest.mark.asyncio
async def test_invalid_credentials():
    email, password = utils.random_creds()

    client = utils.create_client()
    await st.api.default.post_register.asyncio(
        client=client,
        body=st.models.registration_credentials.RegistrationCredentials(
            username="Test User",
            email=email,
            password=password,
        ),
    )

    with pytest.raises(AssertionError):
        await utils.create_authed_client(email=email, password="wrong_password")
