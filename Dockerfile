FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["MyBudgetApp.Web/MyBudgetApp.Web.csproj", "MyBudgetApp.Web/"]
COPY ["MyBudgetApp.Core/MyBudgetApp.Core.csproj", "MyBudgetApp.Core/"]
COPY ["MyBudgetApp.Data/MyBudgetApp.Data.csproj", "MyBudgetApp.Data/"]
RUN dotnet restore "MyBudgetApp.Web/MyBudgetApp.Web.csproj"
COPY . .
WORKDIR "/src/MyBudgetApp.Web"
RUN dotnet publish "MyBudgetApp.Web.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 10000
ENV ASPNETCORE_URLS=http://+:10000
ENTRYPOINT ["dotnet", "MyBudgetApp.Web.dll"]