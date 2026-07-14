FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

ARG APP_VERSION=1.0.0

WORKDIR /src

COPY . .

RUN dotnet restore Solidarity.Api/Solidarity.Api.csproj

RUN dotnet publish Solidarity.Api/Solidarity.Api.csproj \
    -c Release \
    -p:Version=$APP_VERSION \
    -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0

ARG APP_VERSION=1.0.0

# Versao visivel na imagem (docker inspect) e no processo (endpoint /version).
LABEL org.opencontainers.image.version=$APP_VERSION
LABEL org.opencontainers.image.title="Solidarity API"

ENV APP_VERSION=$APP_VERSION

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "Solidarity.Api.dll"]
