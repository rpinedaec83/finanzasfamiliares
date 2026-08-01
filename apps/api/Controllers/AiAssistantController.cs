using KipuFinanzas.Api.Services;
using KipuFinanzas.SharedContracts;
using Microsoft.AspNetCore.Mvc;

namespace KipuFinanzas.Api.Controllers;

[ApiController]
[Route("api/ai")]
public class AiAssistantController : ControllerBase
{
    private readonly IOpenAiService _openAiService;

    public AiAssistantController(IOpenAiService openAiService)
    {
        _openAiService = openAiService;
    }

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] AiChatRequest request)
    {
        var response = await _openAiService.ProcessChatAsync(Guid.NewGuid(), request);
        return Ok(response);
    }

    [HttpPost("classify")]
    public async Task<IActionResult> Classify([FromBody] string description)
    {
        var classification = await _openAiService.ClassifyTransactionAsync(description);
        return Ok(classification);
    }

    [HttpGet("anomalies")]
    public async Task<IActionResult> GetAnomalies()
    {
        var anomalies = await _openAiService.DetectAnomaliesAsync(Guid.NewGuid());
        return Ok(anomalies);
    }
}
