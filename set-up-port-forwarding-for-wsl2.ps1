#[netsh interface portproxy add] Helper
#runs netsh interface portproxy add v4tov4 listenport=6379 listenaddress=0.0.0.0 connectport=6379 connectaddress=wsl2_address for example to redirect to host (only works on locahost)

# check if you are in administration mode, if not, ask for authorization
If (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator"))
{   
	$arguments = "& '" + $myinvocation.mycommand.definition + "'"
	Start-Process powershell -Verb runAs -ArgumentList $arguments
	Break
}

# get wsl intern ip
$wsl_host = $(wsl hostname -I);

# here you specify the ports for the proxy, for example, #$ports = @(6379, 5432, 1433);
#Redis is 6379
#Postgres is 5432
#SQl Server is 1433 
#1025 Docker-based MailDev SMTP
#1080 Docker-based MailDev Web Email Client
$ports = @(6379, 1533, 1025, 1080);

# reset all interfaces
Invoke-Expression "netsh interface portproxy reset";
for ( $i = 0; $i -lt $ports.length; $i++ ) {
	$port = $ports[$i];
	Invoke-Expression "netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=$port connectport=$port connectaddress=$wsl_host";
}
Invoke-Expression "netsh interface portproxy show v4tov4";