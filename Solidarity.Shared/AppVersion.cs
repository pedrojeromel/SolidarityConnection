using System.Reflection;

namespace Solidarity.Shared;

public static class AppVersion
{
    /// <summary>
    /// Versao do build corrente. Vem do InformationalVersion gravado no assembly
    /// (definido em Directory.Build.props e sobrescrito pelo CI). Cai para a
    /// variavel APP_VERSION da imagem caso o assembly nao traga o atributo.
    /// </summary>
    public static string Current { get; } = Resolve();

    private static string Resolve()
    {
        var informational = Assembly
            .GetEntryAssembly()
            ?.GetCustomAttribute<AssemblyInformationalVersionAttribute>()
            ?.InformationalVersion;

        if (!string.IsNullOrWhiteSpace(informational))
        {
            // O SDK anexa "+<commit>" ao InformationalVersion; mantemos so o semver.
            return informational.Split('+')[0];
        }

        return Environment.GetEnvironmentVariable("APP_VERSION")
            ?? "0.0.0";
    }
}
