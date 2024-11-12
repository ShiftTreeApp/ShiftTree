import uuid

import st
import st.api.default.get_schedules
import st.api.default.post_login
import st.models.credentials
import st.api.default.post_register
import st.models.registration_credentials

base_url = "http://localhost:3000"


def create_client(*, base_url: str = base_url):
    return st.Client(base_url=base_url)


async def create_authed_client(*, base_url: str = base_url, email: str, password: str):
    client = st.Client(base_url=base_url)
    user = await st.api.default.post_login.asyncio_detailed(
        client=client,
        body=st.models.credentials.Credentials(email=email, password=password),
    )
    assert user.parsed is not None, user
    return st.AuthenticatedClient(base_url=base_url, token=user.parsed.access_token)


def random_creds():
    email = f"{uuid.uuid4().hex[:8]}@example.com"
    password = uuid.uuid4().hex[:12]

    return email, password


async def create_account_and_login():
    client = st.Client(base_url=base_url)
    email, password = random_creds()
    await st.api.default.post_register.asyncio_detailed(
        client=client,
        body=st.models.registration_credentials.RegistrationCredentials(
            email=email,
            password=password,
            username="Test User",
        ),
    )
    client = await create_authed_client(email=email, password=password)
    return client, email
