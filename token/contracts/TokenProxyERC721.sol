pragma solidity ^0.8.0;

import "@c-layer/common/contracts/core/OperableProxy.sol";
import "./interface/ITokenProxyERC721.sol";
import "./TokenCore.sol";


/**
 * @title Token proxy
 * @dev Token proxy default implementation
 *
 * @author Cyril Lapinte - <cyril.lapinte@openfiz.com>
 * SPDX-License-Identifier: MIT
 */
contract TokenProxyERC721 is ITokenProxyERC721, OperableProxy {

  // solhint-disable-next-line no-empty-blocks
  constructor(address _core) OperableProxy(_core) { }

  function supportsInterface(bytes4 _interfaceId) external override view returns (bool)
  {
    return _interfaceId == type(IERC165).interfaceId
      || _interfaceId == type(IERC721).interfaceId;
      // || _interfaceId == type(IERC721Enumerable).interfaceId
      // || _interfaceId == type(IERC721Metadata).interfaceId;
  }

  function balanceOf(address _owner) external override view returns (uint256 balance)
  {
    return staticCallUint256();
  }

  function ownerOf(uint256 _tokenId) external override view returns (address owner)
  {
    return msg.sender;
  }

  function transferFrom(address _from, address _to, uint256 _tokenId) external override
  {}

  function safeTransferFrom(address _from, address _to, uint256 _tokenId) external override
  {}

  function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes calldata data) external override
  {}

  function approve(address _approved, uint256 _tokenId) external override
  {}

  function getApproved(uint256 _tokenId) external override view returns (address operator)
  {
    return msg.sender;
  }

  function setApprovalForAll(address _operator, bool _approved) external override
  {}

  function isApprovedForAll(address _owner, address _operator) external override view returns (bool)
  {
    return false;
  }

  function canTransfer(address _from, address _to, uint256 _tokenId)
    override public view returns (uint256)
  {
    return staticCallUint256();
  }

  function emitTransfer(address _from, address _to, uint256 _tokenId)
    override public onlyCore returns (bool)
  {
    emit Transfer(_from, _to, _tokenId);
    return true;
  }

  function emitApproval(address _owner, address _approved, uint256 _tokenId)
    override public onlyCore returns (bool)
  {
    emit Approval(_owner, _approved, _tokenId);
    return true;
  }

  function emitApprovalForAll(address _owner, address _operator, bool _approved)
    override public onlyCore returns (bool)
  {
    emit ApprovalForAll(_owner, _operator, _approved);
    return true;
  }
}
