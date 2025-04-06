<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" encoding="utf-8" omit-xml-declaration="yes" media-type="text/html" />
	<xsl:template match="/">
		<html>
			<head>
				<meta http-equiv="refresh" content="3661" />
				<meta charset="UTF-8" />

				<style type="text/css">
					body {font-size: 18px; font-family: monospace;}
					details{
						summary{
							text-transform: uppercase;
							cursor: pointer;
							font-size: 2rem;
							padding: 0.5rem 0 0.5rem 1rem;
							margin-bottom: 0.25rem;
							color: #1369eb !important;							
						}
						summary:hover{
							text-decoration : underline;
							color: blue !important;							
						}

						table{
							font-family: "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
							margin-left: 1rem;
							margin-bottom: 2rem;
							td {
								min-width: 5rem;
							}
						}
					}

					.heading {																		
						h1{
							font-family: monospace;			
							font-size: 3.0rem;
							font-weight: 100;
							color: darkslategray !important;												
							text-transform: uppercase;
							padding-left: 0;
							margin: 0;												
						}
						div{
						    font-size: 13px;
							font-family: "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
							color: gray
							padding: 0.5rem 0.5rem 0.5rem 1rem;
							margin: 0;
						}						
					}					
					div.warn {
						color: firebrick !important;
					}
					details {
						div.warn {
							padding-left: 1rem;
						}
					}
					table { border-collapse: collapse; text-align:left;}
					td,th{ border: solid 1px #333; padding:0.5rem 0.25rem}
					table tr td table { border-collapse: collapse; text-align:left; width:100%}
					td.pkemailcontainer table, td.pkemailcontainer td, td.pkemailcontainer th { border: none !important;  }
				</style>
			</head>
			<body>
				<section class="heading" >
					<h1><xsl:value-of select="Response/Phrases/Name"/></h1>
					<div><xsl:value-of select="Response/Phrases/About"/></div>
					<div class="warn"><xsl:value-of select="Response/Phrases/ForYourSafety"/></div>
					<div>
						<a href="{concat(Response/HostURL/., Response/UserDetails/UserLanguage/Value, '/about/privacy/')}" target="_blank">
							<xsl:value-of select="Response/Phrases/YourRights"/>
						</a>
					</div>
				</section>				
				<details class="pkyourdetailsname">
					<summary><xsl:value-of select="Response/Phrases/YourName/Name"/></summary>
					<section>
						<table>
							<tbody>
								<tr>
									<td style="max-width:200px;width:200px"><xsl:value-of select="Response/Phrases/YourName/Title"/></td>
									<td>
										<xsl:value-of select="Response/UserDetails/UserName/Title/."/>
									</td>
								</tr>
								<tr>
									<td><xsl:value-of select="Response/Phrases/YourName/FirstName"/></td>
									<td>
										<xsl:value-of select="Response/UserDetails/UserName/FirstName/."/>
									</td>
								</tr>
								<tr>
									<td><xsl:value-of select="Response/Phrases/YourName/MiddleName"/></td>
									<td>
										<xsl:value-of select="Response/UserDetails/UserName/MiddleName/."/>
									</td>
								</tr>
								<tr>
									<td><xsl:value-of select="Response/Phrases/YourName/LastName"/></td>
									<td>
										<xsl:value-of select="Response/UserDetails/UserName/LastName/."/>
									</td>
								</tr>
								<tr>
									<td><xsl:value-of select="Response/Phrases/YourName/NickName"/></td>
									<td>
										<xsl:value-of select="Response/UserDetails/UserName/NickName/."/>
									</td>
								</tr>
								<tr>
									<td><xsl:value-of select="Response/Phrases/YourName/DisplayName"/></td>
									<td>
										<xsl:value-of select="Response/UserDetails/UserName/DisplayName/."/>
									</td>
								</tr>
							</tbody>
						</table>
					</section>
				</details>
				<details class="pkyourdetailsnamedisplaysettings">
					<summary><xsl:value-of select="Response/Phrases/YourDisplaySettings/Name"/></summary>
					<section>
						<table>
							<tr>
								<td>
									<xsl:value-of select="Response/Phrases/YourDisplaySettings/OnLowSpeedConnection"/>
								</td>
								<td>
									<xsl:value-of select="Response/UserDetails/UserDisplaySettings/IsOnLowSpeedConnectionText"/>
								</td>
							</tr>
							<tr>
								<td>
									<xsl:value-of select="Response/Phrases/YourDisplaySettings/AnimationDisabled"/>
								</td>
								<td>
									<xsl:value-of select="Response/UserDetails/UserDisplaySettings/DisableAnimationsText"/>
								</td>
							</tr>
							<tr>
								<td>
									<xsl:value-of select="Response/Phrases/YourDisplaySettings/BackgroundAdsDisabled"/>
								</td>
								<td>
									<xsl:value-of select="Response/UserDetails/UserDisplaySettings/ShowBackgroundVideoText"/>
								</td>
							</tr>
							<tr>
								<td>
									<xsl:value-of select="Response/Phrases/YourDisplaySettings/Theme"/>
								</td>
								<td>
									<xsl:value-of select="Response/UserDetails/Theme"/>
								</td>
							</tr>
							<tr>
								<td>
									<xsl:value-of select="Response/Phrases/YourDisplaySettings/Language"/>
								</td>
								<td>
									<xsl:value-of select="Response/UserDetails/UserLanguage/Name"/>
								</td>
							</tr>
						</table>
					</section>
				</details>
				<details class="pkyourdetailsnameyourcommunicationpreferences">
					<summary><xsl:value-of select="Response/Phrases/YourCommunicationPreferences/Name"/></summary>
					<section>
						<table>
							<tr>
								<td>
									<xsl:value-of select="Response/Phrases/YourCommunicationPreferences/UseInApp"/>
								</td>
								<td>
									<xsl:value-of select="Response/UserDetails/UserCommunicationPreferences/UseInAppText"/>
								</td>
							</tr>
							<tr>
								<td>
									<xsl:value-of select="Response/Phrases/YourCommunicationPreferences/UseEmail"/>
								</td>
								<td>
									<xsl:value-of select="Response/UserDetails/UserCommunicationPreferences/UseEmailText"/>
								</td>
							</tr>
							<tr>
								<td>
									<xsl:value-of select="Response/Phrases/YourCommunicationPreferences/UseSMS"/>
								</td>
								<td>
									<xsl:value-of select="Response/UserDetails/UserCommunicationPreferences/UseSMSText"/>
								</td>
							</tr>
							<tr>
								<td>
									<xsl:value-of select="Response/Phrases/YourCommunicationPreferences/UseWhatsApp"/>
								</td>
								<td>
									<xsl:value-of select="Response/UserDetails/UserCommunicationPreferences/UseWhatsAppText"/>
								</td>
							</tr>
							<tr>
								<td>
									<xsl:value-of select="Response/Phrases/YourCommunicationPreferences/UseiMessage"/>
								</td>
								<td>
									<xsl:value-of select="Response/UserDetails/UserCommunicationPreferences/UseIMessageText"/>
								</td>
							</tr>							
						</table>
					</section>
				</details>
				<details class="pkyouremailaddresses" >
					<summary><xsl:value-of select="Response/Phrases/YourEmailAddresses/Name"/></summary>
					<section>
						<table>
							<thead>
								<th>
									<xsl:value-of select="Response/Phrases/YourEmailAddresses/EmailAddress"/>
								</th>
								<th>
									<xsl:value-of select="Response/Phrases/YourEmailAddresses/Type"/>
								</th>
								<th>
									<xsl:value-of select="Response/Phrases/YourEmailAddresses/Verified"/>
								</th>
							</thead>
							<tbody>
								<xsl:apply-templates select="Response/UserDetails/UserEmailAddresses" ></xsl:apply-templates>
							</tbody>
						</table>
					</section>
				</details>
				<details class="pkyourphonenumbers" >
					<summary>
						<xsl:value-of select="Response/Phrases/YourPhoneNumbers/Name"/>
					</summary>
					<section>
						<table>
							<thead>
								<tr>
									<th>
										<xsl:value-of select="Response/Phrases/YourPhoneNumbers/PhoneNumber"/>
									</th>
									<th>
										<xsl:value-of select="Response/Phrases/YourPhoneNumbers/Type"/>
									</th>
									<th>
										<xsl:value-of select="Response/Phrases/YourPhoneNumbers/Verified"/>
									</th>
								</tr>
							</thead>
							<tbody>
								<xsl:apply-templates select="Response/UserDetails/UserPhoneNumbers" ></xsl:apply-templates>
							</tbody>
						</table>
					</section>
				</details>
				<details class="pkyoursecuritysettings" >
					<summary>
						<xsl:value-of select="Response/Phrases/YourSecuritySettings/Name"/>
					</summary>
					<section>
						<table>
							<tr>
								<td>
									<xsl:value-of select="Response/Phrases/YourSecuritySettings/UseTwoFactorAuthentication"/>
								</td>
								<td></td>
							</tr>
							<tr>
								<td>
									<xsl:value-of select="Response/Phrases/YourSecuritySettings/UseDataEncryption"/>
								</td>
								<td></td>
							</tr>
						</table>
					</section>
				</details>				
				<details class="pkyournotifications" >
					<summary><a href="#yournotifications" name="yournotifications">
						<xsl:value-of select="Response/Phrases/YourNotifications/Name"/>
					</a></summary>
					<section>
						<div class="warn">
							<xsl:value-of select="Response/Phrases/YourNotifications/Warning"/>
						</div>
						<table id="yournotifications">
							<thead>
								<tr>
									<th>
										<xsl:value-of select="Response/Phrases/YourNotifications/CreatedOn"/>
									</th>
									<th>
										<xsl:value-of select="Response/Phrases/YourNotifications/NotificationStrategy"/>
									</th>
									<th>
										<xsl:value-of select="Response/Phrases/YourNotifications/Subject"/>
									</th>									
									<th>
										<xsl:value-of select="Response/Phrases/YourNotifications/Message"/>
									</th>
								</tr>
							</thead>
							<tbody>
								<xsl:apply-templates select="Response/UserDetails/UserNotifications"/>
							</tbody>
						</table>
					</section>
				</details>
				<details class="pkyourgroupnotifications" >
					<summary>
						<xsl:value-of select="Response/Phrases/YourGroupNotifications/Name"/>
					</summary>
					<section>
						<div class="warn">
							<xsl:value-of select="Response/Phrases/YourGroupNotifications/Warning"/>
						</div>
						<table>
							<thead>
								<tr>
									<th>
										<xsl:value-of select="Response/Phrases/YourGroupNotifications/CreatedOn"/>
									</th>
									<th>
										<xsl:value-of select="Response/Phrases/YourNotifications/NotificationStrategy"/>
									</th>
									<th>
										<xsl:value-of select="Response/Phrases/YourGroupNotifications/Subject"/>
									</th>
									<th>
										<xsl:value-of select="Response/Phrases/YourGroupNotifications/Message"/>
									</th>
								</tr>
							</thead>
							<tbody>
								<xsl:apply-templates select="Response/UserDetails/UserGroupNotifications"/>
							</tbody>
						</table>
					</section>
				</details>
				<details class="pkyourlogons" >
					<summary>Your Logons</summary>
					<section>
						<table>
							<thead>																
								<th>Provider</th>
								<th>Provider Id</th>
								<th>Provider Username</th>
							</thead>
							<tbody>
								<xsl:apply-templates select="Response/UserDetails/UserLogons"/>
							</tbody>
						</table>
					</section>
				</details>
				<details class="pkyourcookies" >
					<summary>Your cookies</summary>
					<section>
						<table>
							<tr class="pkcookies">
								<td>
									Cookie
								</td>
								<td>
									<xsl:value-of select="Response/RequestHeaders/cookie"/>
								</td>
								<td>
									Functional
								</td>
							</tr>
						</table>
					</section>
				</details>
				<details class="pkyourlogins" >
					<summary>Your Logins</summary>
					<section>
						<table>
							<thead>
								<tr>
									<th>CreatedOn</th>
									<th>IP</th>
									<th>Client Type</th>
									<th>Client</th>
									<th>Client Name</th>
									<th>Region</th>
									<th>City</th>
									<th>Postcode</th>
									<th>Location</th>
									<th>OS</th>
									<th>OS Version</th>
								</tr>
							</thead>
							<tbody>
								<xsl:apply-templates select="Response/UserDetails/UserLogins"/>
							</tbody>
						</table>
					</section>
				</details>
				<details class="pkyourgroupsandroles" >
					<summary>Your groups and roles</summary>
					<section>
						<table>
							<thead>
								<tr>
									<th>Group</th>
									<th>Role</th>
								</tr>
							</thead>
							<tbody>
								<xsl:apply-templates select="Response/UserDetails/UserGroupAndRoles"/>
							</tbody>
						</table>
					</section>
				</details>
				<details class="pkyourphotos" >
					<summary>Your photos</summary>
					<section>
						<table>
							<thead>
								<tr>
									<th>Photo</th>
									<th>Source</th>
								</tr>
							</thead>
							<tbody>
								<xsl:apply-templates select="Response/UserDetails/UserPhotos"/>
							</tbody>
						</table>
					</section>
				</details>
				<details class="pkyourweblinks" >
					<summary>Your web links</summary>
					<section>
						<table>
							<thead>
								<tr>
									<th>URL</th>
									<th>Type</th>
								</tr>
							</thead>
							<tbody>
								<!--<xsl:apply-templates select="Response/UserDetails/UserWebLinks" ></xsl:apply-templates>-->
							</tbody>
						</table>
					</section>
				</details>
			</body>
		</html>
	</xsl:template>


	<xsl:template match="Response/UserDetails/UserGroupAndRoles">
		<tr>
			<td>
				<xsl:value-of select="Group/DisplayName/." />
			</td>
			<td>
				<xsl:value-of  select="Role/DisplayName/." />
			</td>
		</tr>
	</xsl:template>

	<xsl:template match="Response/UserDetails/UserEmailAddresses">
		<tr>
			<td>
				<xsl:value-of select="EmailAddress/."/>
			</td>
			<td>
				<xsl:value-of select="EmailAddressType/."/>
			</td>
			<td>
				<xsl:choose>
					<xsl:when test="Verified = 'true' ">
						<xsl:value-of select="/Response/Phrases/Yes" />
					</xsl:when>
					<xsl:otherwise>						
						<xsl:value-of select="/Response/Phrases/No"/>
					</xsl:otherwise>
				</xsl:choose>				
			</td>
		</tr>
	</xsl:template>

	<xsl:template match="Response/UserDetails/UserPhoneNumbers">
		<tr>
			<td>
				<xsl:value-of select="PhoneNumber/." />
			</td>
			<td>
				<xsl:value-of select="PhoneType/." />
			</td>
			<td>
				<xsl:choose>
					<xsl:when test="Verified/. = 'true'">						
						<xsl:value-of select="/Response/Phrases/Yes"/>
					</xsl:when>
					<xsl:otherwise>						
						<xsl:value-of select="/Response/Phrases/No"/>
					</xsl:otherwise>
				</xsl:choose>
			</td>
		</tr>
	</xsl:template>

	<xsl:template match="Response/UserDetails/UserPhotos">
		<tr>
			<td>
				<img src="{URL}" />
			</td>
			<td>
				<xsl:value-of select="URL/."/>
			</td>
		</tr>
	</xsl:template>

	<xsl:template match="Response/UserDetails/UserLogons">
		<tr>
			<td>
				<xsl:value-of select="Provider/."/>
			</td>			
			<td>
				<xsl:value-of select="ProviderUserId/."/>
			</td>
			<td>
				<xsl:value-of select="ProviderUserName/."/>
			</td>
		</tr>
	</xsl:template>

	<xsl:template match="Response/UserDetails/UserLogins">
		<tr>
			<td>
				<xsl:value-of select="CreatedOn/."/>
			</td>
			<td>
				<xsl:value-of select="IPAddress/."/>
			</td>
			<td>
				<xsl:value-of select="DeviceType/."/>
			</td>
			<td>
				<xsl:value-of select="ClientType/."/>
			</td>
			<td>
				<xsl:value-of select="ClientName/."/>
			</td>
			<td>
				<xsl:value-of select="Region/." />
			</td>
			<td>
				<xsl:value-of select="City/." />
			</td>
			<td>
				<xsl:value-of select="Postcode/."/>
			</td>
			<td>
				<xsl:value-of select="Location/."/>
			</td>
			<td>
				<xsl:value-of select="OSName/."/>
			</td>
			<td>
				<xsl:value-of select="OSPlatform/."/>
			</td>
		</tr>
	</xsl:template>

	<xsl:template match="Response/UserDetails/UserNotifications">
		<tr>
			<td>
				<xsl:value-of select="CreatedOn"/>
			</td>
			<td>
				<xsl:value-of select="NotificationStrategy/."/>
			</td>			
			<td>
				<xsl:value-of select="Subject" disable-output-escaping="yes"/>
			</td>
			<td class="pkemailcontainer">
				<xsl:value-of select="Message" disable-output-escaping="yes" />
			</td>
		</tr>
	</xsl:template>

	<xsl:template match="Response/UserDetails/UserGroupNotifications">
		<tr>
			<td>
				<xsl:value-of select="CreatedOn/."/>
			</td>
			<td>
				<xsl:value-of select="NotificationStrategy/."/>
			</td>
			<td>
				<xsl:element name="span">
					<xsl:value-of select="Subject" disable-output-escaping="yes"/>
				</xsl:element>
			</td>
			<td>
				<xsl:value-of select="Message" disable-output-escaping="yes" />
			</td>
		</tr>
	</xsl:template>

</xsl:stylesheet>




