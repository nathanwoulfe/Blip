namespace Blip.Events;

public interface IServerVariablesSendingExecutor
{
    void Generate(IDictionary<string, object> dictionary);
}
