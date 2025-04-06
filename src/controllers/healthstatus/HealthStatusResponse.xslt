<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template match="/">
		<html>
			<head>
				<![CDATA[
				<style type="text/css">										
					.batch-pill-os { padding: 15px 45px !important; text-transform: capitalize; }
					.batch-pill-win32{ background-color: #0020fA !important; }
					.batch-pill-linux{ background-color: #A0202A !important; }
					.contributors, .contributors table, .contributors tr, .contributors td { margin:0 !important; padding:0 !important;}
					.engines, .engines table, .engines tr, .engines td { margin:0 !important; padding:0 !important;}
					.running{font-size:16px}
					.running:after {overflow: hidden;display: inline-block;vertical-align: bottom;-webkit-animation: ellipsis steps(4,end) 900ms infinite;animation: ellipsis steps(4,end) 900ms infinite;content: "\u2026";width: 0px;}
					@keyframes ellipsis {to {width: 1.25em;}}
					@-webkit-keyframes ellipsis {to {width: 1.25em}}
					.pkmainmenucontainerbarwait {width: 1rem; margin-bottom: 0rem;padding: 0rem; vertical-align:middle; transform:rotate(90deg)}
					h5 {font-size: 1rem !important;}								
				</style>
				]]>
				<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous" />
			</head>
			<body>
				<main class="container">
					<table class="table">
						<tr class="header" >
							<th colspan="2">
								<h1>Health Check</h1>
							</th>
						</tr>
						<tr class="status">
							<td><h5>Status</h5></td>
							<td>
								<progress class="pkmainmenucontainerbarwait">100</progress>
								<span class="running">
									<xsl:value-of select="Response/Status/."/>
								</span>
							</td>
						</tr>
						<tr class="datetime">
							<td><h5>System Time(UTC)</h5></td>
							<td><xsl:value-of select="Response/UTCDate/."/></td>
						</tr>
						<tr class="swagger">
							<td><h5>Swagger endpoint</h5></td>
							<td><a href="{Response/SwaggerEndPoint/.}" target="_blank" ><xsl:value-of select="Response/SwaggerEndPoint/."/></a></td>
						</tr>
						<tr class="workerservices">
							<td>
								<h5>Worker Services</h5>
							</td>
							<td>
								<table>
									<tr>
										<td>
											Email Notification Worker Service
										</td>
										<td>
											<progress class="pkmainmenucontainerbarwait">100</progress>
											<span class="running">Running</span>
										</td>
									</tr>
									<tr>
										<td>
											SMS Notification Worker Service
										</td>
										<td>
											<progress class="pkmainmenucontainerbarwait">100</progress>
											<span class="running">Running</span>
										</td>
									</tr>
									<tr>
										<td>
											WhatsApp Notification Worker Service
										</td>
										<td>
											<progress class="pkmainmenucontainerbarwait">100</progress>
											<span class="running">Running</span>
										</td>
									</tr>
									<tr>
										<td>
											InApp Notification Worker Service
										</td>
										<td>
											<progress class="pkmainmenucontainerbarwait">100</progress>
											<span class="running">Running</span>
										</td>
									</tr>									
								</table>
							</td>
						</tr>
						<xsl:apply-templates select="Response/PackageJSON" />
					</table>					
				</main>
			</body>
			<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
			<script src="https://cdn.jsdelivr.net/npm/popper.js@1.14.7/dist/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
			<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
		</html>
	</xsl:template>

	<xsl:template match="PackageJSON">
		<tr class="packagejson">
			<td colspan="2">
				<h2>Package.json</h2>
			</td>
		</tr>
		<tr class="packagejson-version">
			<td><h5>Version</h5></td>
			<td><xsl:value-of select="./version/."/></td>
		</tr>
		<tr class="packagejson-description">
			<td><h5>Description</h5></td>
			<td><xsl:value-of select="description/."/></td>
		</tr>
		<tr class="packagejson-contributors">
			<td><h5>Contributors</h5></td>
			<td><table class="contributors"><xsl:apply-templates select="contributors" ></xsl:apply-templates></table></td>
		</tr>
		<tr class="packagejson-copyright-owner">
			<td><h5>Copyright Owner</h5></td>
			<td><xsl:value-of select="copyright.owner/."/></td>
		</tr>
		<tr class="packagejson-documentation-homepage">
			<td><h5>Documentation homepage</h5></td>
			<td><xsl:value-of select="homepage/."/></td>
		</tr>
		<tr class="packagejson-license">
			<td><h5>License</h5></td>
			<td><xsl:value-of select="license/."/></td>
		</tr>
		<tr class="packagejson-engines">
			<td><h5>Engines</h5></td>
			<td>
				<table class="engines">
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
		<tr class="packagejson-dependencies">
			<td><h5>Known Issues</h5></td>
			<td>
				<article>
					<ul class="list-group">
						<xsl:apply-templates select="knownIssues/knownIssue"/>
					</ul>
				</article>
			</td>
		</tr>
		<tr class="packagejson-os">
			<td><h5>OS</h5></td>
			<td>
				<table>
					<xsl:apply-templates select="os"></xsl:apply-templates>
				</table>
			</td>
		</tr>
		<tr class="packagejson-keywords">
			<td><h5>Keywords</h5></td>
			<td>
				<table>
					<xsl:apply-templates select="keywords"></xsl:apply-templates>
				</table>
			</td>
		</tr>
		<tr class="packagejson-main">
			<td><h5>Main entry point</h5></td>
			<td><xsl:value-of select="main/."/></td>
		</tr>
		<tr class="packagejson-types">
			<td><h5>Typescript Type declaration file</h5></td>
			<td><xsl:value-of select="./types/."/></td>
		</tr>
		<tr class="packagejson-dependencies">
			<td><h5>Dependencies</h5></td>
			<td>
				<table>
					<tr>
						<td>
							<h6>Dependency</h6>
						</td>
						<td>
							<h6>Version</h6>
						</td>
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
				<span class="badge badge-primary batch-pill-os badge-pill batch-pill-{.}">
					<xsl:value-of select="."/>
				</span>

			</td>
		</tr>
	</xsl:template>

	<xsl:template match="knownIssue">
		<li class="list-group-item">
			<p>
				<xsl:value-of select="title/."/>
				<span class="badge badge-warning">Low Impact</span>
				<br/>
				<a href="{link/.}" target="_blank">
					<xsl:value-of select="link/."/>
				</a>
				<br/>
				<xsl:value-of select="description/."/>
			</p>
		</li>
	</xsl:template>

	<xsl:template match="dependency">
		<tr>
			<td>
				<xsl:value-of select="./name/." disable-output-escaping="yes" />
			</td>
			<td>
				<span class="badge badge-primary badge-pill">
					<xsl:value-of select="./version/." disable-output-escaping="yes"/>
				</span>
			</td>
		</tr>
	</xsl:template>

</xsl:stylesheet>




