#if NETFRAMEWORK
using System;
using System.Collections.Generic;
using Umbraco.Core.Composing;
using Umbraco.Web.JavaScript;

namespace Blip.Web.Events {

    public class WebComponent : IComponent
    {
        private readonly IServerVariablesSendingExecutor _serverVariablesSendingExecutor;

        public WebComponent(IServerVariablesSendingExecutor serverVariablesSendingExecutor)
        {
            _serverVariablesSendingExecutor = serverVariablesSendingExecutor ?? throw new ArgumentNullException(nameof(serverVariablesSendingExecutor));

            // bind events
            ServerVariablesParser.Parsing += ServerVariablesParser_Parsing;        
        }

        public void Initialize()
        {

        }
        
        public void Terminate()
        {
            ServerVariablesParser.Parsing -= ServerVariablesParser_Parsing;            
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void ServerVariablesParser_Parsing(object sender, IDictionary<string, object> e) =>
            _serverVariablesSendingExecutor.Generate(e);          
    }
}
#endif