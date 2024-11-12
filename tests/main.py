import asyncio
import json

import st
import st.api.default.get_schedules
import st.api.default.post_login
import st.models.credentials


async def create_authed_client(*, base_url: str, email: str, password: str):
    client = st.Client(base_url=base_url)
    user = await st.api.default.post_login.asyncio(
        client=client,
        body=st.models.credentials.Credentials(email=email, password=password),
    )
    assert user is not None
    return st.AuthenticatedClient(base_url=base_url, token=user.access_token)


async def main():
    client = await create_authed_client(
        base_url="http://localhost:3000",
        email="user1@example.com",
        password="password1",
    )
    schedules = await st.api.default.get_schedules.asyncio(
        client=client,
    )
    assert schedules is not None
    print(json.dumps([s.to_dict() for s in schedules], indent=2))


if __name__ == "__main__":
    asyncio.run(main())
