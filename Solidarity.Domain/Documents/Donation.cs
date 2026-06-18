using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Solidarity.Domain.Documents;

public class Donation
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonGuidRepresentation(GuidRepresentation.Standard)]
    public Guid CampaignId { get; set; }

    [BsonGuidRepresentation(GuidRepresentation.Standard)]
    public Guid DonorId { get; set; }

    public decimal Amount { get; set; }

    public DateTime CreatedAt { get; set; }
}