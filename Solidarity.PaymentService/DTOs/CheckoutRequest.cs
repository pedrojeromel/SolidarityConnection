namespace Solidarity.PaymentService.DTOs;

public sealed class CardInput
{
    public string Number { get; set; } = string.Empty;
    public string Holder { get; set; } = string.Empty;
    public string ExpiryMonth { get; set; } = string.Empty;
    public string ExpiryYear { get; set; } = string.Empty;
    public string Cvv { get; set; } = string.Empty;
}

public sealed class AddressInput
{
    public string ZipCode { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string Number { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
}

public sealed class CheckoutRequest
{
    public Guid CampaignId { get; set; }
    public decimal Amount { get; set; }
    public CardInput Card { get; set; } = new();
    public AddressInput Address { get; set; } = new();
}

public sealed class CheckoutResponse
{
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
