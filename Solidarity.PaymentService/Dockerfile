FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

ARG APP_VERSION=1.0.0

WORKDIR /src

COPY . .

RUN dotnet restore Solidarity.PaymentService/Solidarity.PaymentService.csproj

RUN dotnet publish Solidarity.PaymentService/Solidarity.PaymentService.csproj \
    -c Release \
    -p:Version=$APP_VERSION \
    -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0

ARG APP_VERSION=1.0.0

LABEL org.opencontainers.image.version=$APP_VERSION
LABEL org.opencontainers.image.title="Solidarity Payment Service"

ENV APP_VERSION=$APP_VERSION

# curl para o HEALTHCHECK (a imagem aspnet nao inclui).
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "Solidarity.PaymentService.dll"]
