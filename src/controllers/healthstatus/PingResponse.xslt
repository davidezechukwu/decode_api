<?xml version="1.0" encoding="utf-8"?>

<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template match="/">
		<html>
			<head>
				<style type="text/css">
					body {font-size: 12px}
					table { border-collapse: collapse; text-align:left;}
					td,th{ border: solid 1px #333; padding:0.5rem 0.25rem}
					table tr td table { border-collapse: collapse; text-align:left; width:100%}
				</style>
			</head>
			<body>
				<table>
					<tr class="header" >
						<th colspan="2">HTTP Ping</th>
					</tr>
					<!--<tr class="status">
						<td>Status</td>
						<td>
							<xsl:value-of select="Response/Status/."/>
						</td>
					</tr>
					<tr class="datetime">
						<td>System date and time (UTC)</td>
						<td>
							<xsl:value-of select="Response/UTCDate/."/>
						</td>
					</tr>
					<tr class="swagger">
						<td>Swagger endpoint</td>
						<td>
							<a href="{Response/SwaggerEndPoint/.}">
								<xsl:value-of select="Response/SwaggerEndPoint/."/>
							</a>
						</td>
					</tr>
					<xsl:apply-templates select="Response/PackageJSON" />-->
				</table>
			</body>
		</html>
	</xsl:template>

	<!--<xsl:template match="PackageJSON">
		<tr class="packagejson">
			<td colspan="2">
				Package.json
			</td>
		</tr>
		<tr class="packagejson-version">
			<td>
				Version
			</td>
			<td>
				<xsl:value-of select="./version/."/>
			</td>
		</tr>
		<tr class="packagejson-description">
			<td>
				Description
			</td>
			<td>
				<xsl:value-of select="description/."/>
			</td>
		</tr>
		<tr class="packagejson-contributors">
			<td>
				Contributors
			</td>
			<td>
				<table>
					<xsl:apply-templates select="contributors" ></xsl:apply-templates>
				</table>
			</td>
		</tr>
		<tr class="packagejson-copyright-owner">
			<td>
				Copyright Owner
			</td>
			<td>
				<xsl:value-of select="copyright.owner/."/>
			</td>
		</tr>
		<tr class="packagejson-documentation-homepage">
			<td>
				Documentaion homepage
			</td>
			<td>
				<xsl:value-of select="homepage/."/>
			</td>
		</tr>
		<tr class="packagejson-license">
			<td>
				License
			</td>
			<td>
				<xsl:value-of select="license/."/>
			</td>
		</tr>
		<tr class="packagejson-engines">
			<td>
				Engines
			</td>
			<td>
				<table>
					<tr>
						<td>
							Node
						</td>
						<td>
							<xsl:value-of select="engines/node/."  disable-output-escaping="yes"/>
						</td>
					</tr>
					<tr>
						<td>
							NPM
						</td>
						<td>
							<xsl:value-of select="engines/npm/."  disable-output-escaping="yes"/>
						</td>
					</tr>
				</table>
			</td>
		</tr>
		<tr class="packagejson-os">
			<td>
				OS
			</td>
			<td>
				<table>
					<xsl:apply-templates select="os"></xsl:apply-templates>
				</table>
			</td>
		</tr>
		<tr class="packagejson-keywords">
			<td>
				Keywords
			</td>
			<td>
				<table>
					<xsl:apply-templates select="keywords"></xsl:apply-templates>
				</table>
			</td>
		</tr>
		<tr class="packagejson-main">
			<td>
				Main entry point
			</td>
			<td>
				<xsl:value-of select="main/."/>
			</td>
		</tr>
		<tr class="packagejson-types">
			<td>
				Typescript Type declaration file
			</td>
			<td>
				<xsl:value-of select="./types/."/>
			</td>
		</tr>
		<tr class="packagejson-dependencies">
			<td>
				Dependencies
			</td>
			<td>
				<table>
					<tr>
						<td>Dependency</td>
						<td>Version</td>
					</tr>
					<xsl:apply-templates select="dependency" ></xsl:apply-templates>
				</table>
			</td>
		</tr>
	</xsl:template>

	<xsl:template match="contributors">
		<tr>
			<td>
				<xsl:value-of select="name/."/>
			</td>
		</tr>
		<tr>
			<td>
				<a href="{email/.}" target="_blank">
					<xsl:value-of select="email/."/>
				</a>
			</td>
		</tr>
		<tr>
			<td>
				<a href="{url/.}" target="_blank">
					<xsl:value-of select="url/."/>
				</a>
			</td>
		</tr>
		<tr>
			<td>
				<br/>
			</td>
		</tr>
	</xsl:template>

	<xsl:template match="keywords">
		<tr>
			<td>
				<xsl:value-of select="."/>
			</td>
		</tr>
	</xsl:template>

	<xsl:template match="os">
		<tr>
			<td>
				<xsl:value-of select="."/>
			</td>
		</tr>
	</xsl:template>

	<xsl:template match="dependency">
		<tr>
			<td>
				<xsl:value-of select="./name/." disable-output-escaping="yes" />
			</td>
			<td>
				<xsl:value-of select="./version/." disable-output-escaping="yes"/>
			</td>
		</tr>
	</xsl:template>-->

</xsl:stylesheet>




