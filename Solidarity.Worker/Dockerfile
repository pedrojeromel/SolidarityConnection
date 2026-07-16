FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

ARG APP_VERSION=1.0.0

WORKDIR /src

COPY . .

RUN dotnet restore Solidarity.Worker/Solidarity.Worker.csproj

RUN dotnet publish Solidarity.Worker/Solidarity.Worker.csproj \
    -c Release \
    -p:Version=$APP_VERSION \
    -o /app/publish

FROM mcr.microsoft.com/dotnet/runtime:10.0

ARG APP_VERSION=1.0.0

LABEL org.opencontainers.image.version=$APP_VERSION
LABEL org.opencontainers.image.title="Solidarity Worker"

ENV APP_VERSION=$APP_VERSION

WORKDIR /app

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Solidarity.Worker.dll"]
