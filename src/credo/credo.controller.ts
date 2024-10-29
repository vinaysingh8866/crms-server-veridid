import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { CredoService } from './credo.service';
import { ApiCreatedResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { API_VERSION } from 'src/constants';
import { CreateAgentDto, IssueCredentialDto } from './dto/credo.dto';
import { CredentialExchangeRecord, ProofExchangeRecord} from '@credo-ts/core';

@Controller(`${API_VERSION}/credo`)

export class CredoController {
  private readonly logger = new Logger(CredoController.name);
  constructor(private readonly credoService: CredoService) {}

  @Get('agent-alice')
  createAgentAlice(): string {
    this.credoService.createAgent("Alice", "http://localhost", 9000, 4000, 5000);
    return 'Started agent';
  }

  @Get('agent-faber')
  createAgentFaber(): string {
    this.credoService.createAgent("Faber", "http://localhost", 9001, 4001, 5001);
    return 'Started agent';
  }
  private agentId: string;
  
  @ApiTags("Agent")
  @Post('Initialize')
  async startAgent(@Body() createAgentDto: CreateAgentDto): Promise<string> {
    
    
    await this.credoService.createAgent(
      createAgentDto.name,
      createAgentDto.endpoint,
      createAgentDto.port,
      createAgentDto.oid4vcPort,
      createAgentDto.oid4vcListen
    )
    this.agentId = createAgentDto.name;
    return 'Agent started';
    // startAgent(createAgentDto);
  }

  /**
   * Issue credential.
   */
  @ApiTags("Credentials")
  @Post('issue-Credential')
  @ApiOperation({summary:"Issue Anon-Cred Credentials"})
  @ApiCreatedResponse({description:"Credential Sent successfully"})
  @ApiQuery({ name: 'agentName', required: true, type: String })
  async issueCredentials(@Body() issueCredentialDto:IssueCredentialDto, @Query('agentName') agentName:string){
    const{connectionId, credentialDefinitionId, attributes} = issueCredentialDto;
    const credentialExchangeRecord = this.credoService.issueCredential(connectionId,credentialDefinitionId,attributes,agentName)
    return credentialExchangeRecord;
  }
  
  @ApiTags("Verification")
  @Post('send-proof-request')
  @ApiOperation({summary:"Create Proof Request"})
  @ApiCreatedResponse({description:"Proof Request Sent successfully"})
  @ApiQuery({ name: 'agentName', required: true, type: String })
  async sendProofRequest(@Query('agentName') agentName:string){
    await this.credoService.sendProofRequest(agentName)
    return "Proof Request Sent"
  }
  
  @ApiTags("Verification")
  @Post('accept-proof-request')
  @ApiOperation({summary:"Accept Proof Request"})
  @ApiQuery({ name: 'agentName', required: true, type: String })
  async acceptProofRequest(@Body() proofExchangeRecord:ProofExchangeRecord,@Query('agentName') agentName:string){
    await this.credoService.acceptProofRequest(proofExchangeRecord,agentName)
    return "Proof Request Accepted"
  }
  
}
